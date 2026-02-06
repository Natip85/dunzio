import { TRPCError } from "@trpc/server";
import {
  and,
  asc,
  desc,
  eq,
  exists,
  gt,
  gte,
  ilike,
  inArray,
  lt,
  lte,
  notInArray,
  or,
  sql,
} from "drizzle-orm";
import { z } from "zod";

import { boardColumn, issue, issueLabel, project } from "@dunzio/db/schema/projects";
import { createIssueSchema, issueFilterSchema, updateIssueSchema } from "@dunzio/db/validators";

import type { Context } from "../trpc";
import { createTRPCRouter, protectedProcedure } from "../trpc";

// Time thresholds for "recently updated" filter (in hours)
const RECENTLY_UPDATED_THRESHOLDS = {
  "1h": 1,
  "24h": 24,
  "7d": 168,
  "30d": 720,
} as const;

/**
 * Build where conditions for filtering issues based on the provided filter params.
 */
function buildIssueWhereConditions({
  db,
  filter,
  userId,
  doneColumnIds,
}: {
  db: Context["db"];
  filter: z.infer<typeof issueFilterSchema> | undefined;
  userId: string;
  doneColumnIds: string[];
}) {
  const conditions: ReturnType<typeof eq>[] = [];

  if (!filter) return conditions;

  // Text search (title or key)
  if (filter.q && filter.q.trim() !== "") {
    const searchTerm = `%${filter.q.trim()}%`;
    const searchCondition = or(ilike(issue.title, searchTerm), ilike(issue.key, searchTerm));
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  // Assignees filter
  if (filter.assignees && filter.assignees.length > 0) {
    const hasUnassigned = filter.assignees.includes("__unassigned__");
    const assigneeIds = filter.assignees.filter((id) => id !== "__unassigned__");

    if (hasUnassigned && assigneeIds.length > 0) {
      // Filter for unassigned OR specific assignees
      const assigneeCondition = or(
        sql`${issue.assigneeId} IS NULL`,
        inArray(issue.assigneeId, assigneeIds)
      );
      if (assigneeCondition) {
        conditions.push(assigneeCondition);
      }
    } else if (hasUnassigned) {
      // Filter for only unassigned tasks
      conditions.push(sql`${issue.assigneeId} IS NULL`);
    } else {
      // Filter for specific assignees only
      conditions.push(inArray(issue.assigneeId, assigneeIds));
    }
  }

  // Reporter filter
  if (filter.reporter) {
    conditions.push(eq(issue.reporterId, filter.reporter));
  }

  // Types filter
  if (filter.types && filter.types.length > 0) {
    conditions.push(inArray(issue.type, filter.types));
  }

  // Priorities filter
  if (filter.priorities && filter.priorities.length > 0) {
    conditions.push(inArray(issue.priority, filter.priorities));
  }

  // Sprint filter
  if (filter.sprint) {
    conditions.push(eq(issue.sprintId, filter.sprint));
  }

  // Epic filter (parent issue)
  if (filter.epic) {
    conditions.push(eq(issue.parentId, filter.epic));
  }

  // Labels filter (many-to-many via issueLabel table)
  if (filter.labels && filter.labels.length > 0) {
    conditions.push(
      exists(
        db
          .select({ one: sql`1` })
          .from(issueLabel)
          .where(and(eq(issueLabel.issueId, issue.id), inArray(issueLabel.labelId, filter.labels)))
      )
    );
  }

  // Only my issues filter
  if (filter.onlyMyIssues) {
    conditions.push(eq(issue.assigneeId, userId));
  }

  // Recently updated filter
  if (filter.recentlyUpdated) {
    const hoursAgo = RECENTLY_UPDATED_THRESHOLDS[filter.recentlyUpdated];
    const threshold = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    conditions.push(gte(issue.updatedAt, threshold));
  }

  // Hide done filter (exclude issues in "done" category columns)
  // Tasks without a column (backlog) are included, tasks in done columns are excluded
  if (filter.hideDone && doneColumnIds.length > 0) {
    conditions.push(notInArray(issue.columnId, doneColumnIds));
  }

  // Hide subtasks filter
  if (filter.hideSubtasks) {
    conditions.push(sql`${issue.type} != 'subtask'`);
  }

  return conditions;
}

export const taskRouter = createTRPCRouter({
  /**
   * Get all tasks/issues for a specific board column with optional filtering.
   * Used to render tasks in kanban columns.
   */
  getByColumn: protectedProcedure
    .input(
      z.object({
        columnId: z.string(),
        filter: issueFilterSchema.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;

      // Get "done" category column IDs for hideDone filter
      let doneColumnIds: string[] = [];
      if (input.filter?.hideDone) {
        const doneColumns = await db.query.boardColumn.findMany({
          where: eq(boardColumn.category, "done"),
          columns: { id: true },
        });
        doneColumnIds = doneColumns.map((c) => c.id);
      }

      // Build filter conditions
      const filterConditions = buildIssueWhereConditions({
        db,
        filter: input.filter,
        userId: session.user.id,
        doneColumnIds,
      });

      // Combine column filter with additional filter conditions
      const whereConditions = [eq(issue.columnId, input.columnId), ...filterConditions];

      const tasks = await db.query.issue.findMany({
        where: and(...whereConditions),
        orderBy: [asc(issue.position)],
        with: {
          assignee: {
            columns: { id: true, name: true, image: true },
          },
          issueLabels: {
            with: {
              label: true,
            },
          },
        },
      });

      return tasks;
    }),

  /**
   * Create a new task/issue.
   * Automatically generates the issue key and number.
   */
  create: protectedProcedure.input(createIssueSchema).mutation(async ({ ctx, input }) => {
    const { session, db } = ctx;

    const content = input.content as (typeof issue.$inferInsert)["content"] | undefined;

    // Get project to generate issue key
    const projectData = await db.query.project.findFirst({
      where: eq(project.id, input.projectId),
    });

    if (!projectData) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Project not found",
      });
    }

    // Get next issue number for project
    const lastIssue = await db.query.issue.findFirst({
      where: eq(issue.projectId, input.projectId),
      orderBy: [desc(issue.number)],
    });

    const nextNumber = (lastIssue?.number ?? 0) + 1;
    const key = `${projectData.key}-${nextNumber}`;

    // Get max position in column for ordering
    let position = 0;
    if (input.columnId) {
      const lastInColumn = await db.query.issue.findFirst({
        where: eq(issue.columnId, input.columnId),
        orderBy: [desc(issue.position)],
      });
      position = (lastInColumn?.position ?? -1) + 1;
    }

    const [newIssue] = await db
      .insert(issue)
      .values({
        projectId: input.projectId,
        key,
        number: nextNumber,
        title: input.title,
        description: input.description,
        content,
        type: input.type,
        priority: input.priority,
        columnId: input.columnId,
        position,
        assigneeId: input.assigneeId,
        storyPoints: input.storyPoints,
        dueDate: input.dueDate,
        reporterId: session.user.id,
      })
      .returning();

    return newIssue;
  }),

  /**
   * Move a task to a new column and/or position.
   * Handles both same-column reordering and cross-column movement.
   */
  move: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        newColumnId: z.string(),
        newPosition: z.number().int().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      // Get the task
      const task = await db.query.issue.findFirst({
        where: eq(issue.id, input.taskId),
      });

      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        });
      }

      // Verify the new column exists
      const column = await db.query.boardColumn.findFirst({
        where: eq(boardColumn.id, input.newColumnId),
      });

      if (!column) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Column not found",
        });
      }

      const oldColumnId = task.columnId;
      const oldPosition = task.position;
      const isSameColumn = oldColumnId === input.newColumnId;

      await db.transaction(async (tx) => {
        if (isSameColumn) {
          // Same column reordering
          if (input.newPosition > oldPosition) {
            // Moving down: shift tasks between old and new position up
            await tx
              .update(issue)
              .set({ position: sql`${issue.position} - 1` })
              .where(
                and(
                  eq(issue.columnId, input.newColumnId),
                  gt(issue.position, oldPosition),
                  lte(issue.position, input.newPosition)
                )
              );
          } else if (input.newPosition < oldPosition) {
            // Moving up: shift tasks between new and old position down
            await tx
              .update(issue)
              .set({ position: sql`${issue.position} + 1` })
              .where(
                and(
                  eq(issue.columnId, input.newColumnId),
                  gte(issue.position, input.newPosition),
                  lt(issue.position, oldPosition)
                )
              );
          }
        } else {
          // Cross-column movement
          // 1. Close the gap in the old column
          if (oldColumnId) {
            await tx
              .update(issue)
              .set({ position: sql`${issue.position} - 1` })
              .where(and(eq(issue.columnId, oldColumnId), gt(issue.position, oldPosition)));
          }

          // 2. Make room in the new column
          await tx
            .update(issue)
            .set({ position: sql`${issue.position} + 1` })
            .where(
              and(eq(issue.columnId, input.newColumnId), gte(issue.position, input.newPosition))
            );
        }

        // Update the task's column and position
        await tx
          .update(issue)
          .set({
            columnId: input.newColumnId,
            position: input.newPosition,
          })
          .where(eq(issue.id, input.taskId));
      });

      return { success: true };
    }),

  /**
   * Get a single task/issue by ID.
   * Used for the edit task dialog.
   */
  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const { db } = ctx;

    const task = await db.query.issue.findFirst({
      where: eq(issue.id, input.id),
      with: {
        assignee: {
          columns: { id: true, name: true, image: true },
        },
        column: {
          columns: { id: true, name: true },
        },
        issueLabels: {
          with: {
            label: true,
          },
        },
      },
    });

    if (!task) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }

    return task;
  }),

  /**
   * Update a task/issue.
   * Updates only the provided fields.
   */
  update: protectedProcedure.input(updateIssueSchema).mutation(async ({ ctx, input }) => {
    const { db } = ctx;

    // Check if task exists
    const existingTask = await db.query.issue.findFirst({
      where: eq(issue.id, input.id),
    });

    if (!existingTask) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }

    // Build update object with only provided fields
    const updateData: Partial<typeof issue.$inferInsert> = {};

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.content !== undefined) {
      updateData.content = input.content as (typeof issue.$inferInsert)["content"];
    }
    if (input.type !== undefined) updateData.type = input.type;
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.columnId !== undefined) updateData.columnId = input.columnId;
    if (input.assigneeId !== undefined) updateData.assigneeId = input.assigneeId;
    if (input.storyPoints !== undefined) updateData.storyPoints = input.storyPoints;
    if (input.dueDate !== undefined) updateData.dueDate = input.dueDate;

    // Always update updatedAt
    updateData.updatedAt = new Date();

    const [updatedTask] = await db
      .update(issue)
      .set(updateData)
      .where(eq(issue.id, input.id))
      .returning();

    return updatedTask;
  }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      await db.delete(issue).where(eq(issue.id, input.id));

      return { success: true };
    }),
});
