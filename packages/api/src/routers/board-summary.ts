import { and, count, desc, eq, gte, inArray, isNull, lte } from "drizzle-orm";
import { z } from "zod";

import { user } from "@dunzio/db/schema/auth";
import { activity, boardColumn, issue } from "@dunzio/db/schema/projects";

import type { Context } from "../trpc";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const boardIdInput = z.object({ boardId: z.string() });

/**
 * Helper: get all column IDs belonging to a board.
 */
async function getBoardColumnIds(db: Context["db"], boardId: string): Promise<string[]> {
  const columns = await db
    .select({ id: boardColumn.id })
    .from(boardColumn)
    .where(eq(boardColumn.boardId, boardId));
  return columns.map((c) => c.id);
}

export const boardSummaryRouter = createTRPCRouter({
  /**
   * Hero stats: completed, updated, created (last 7 days), due soon (next 7 days).
   */
  getHeroStats: protectedProcedure.input(boardIdInput).query(async ({ ctx, input }) => {
    const { db } = ctx;
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const columnIds = await getBoardColumnIds(db, input.boardId);
    if (columnIds.length === 0) {
      return { completed: 0, updated: 0, created: 0, dueSoon: 0 };
    }

    const boardFilter = inArray(issue.columnId, columnIds);

    // Get "done" category column IDs for the completed count
    const doneColumns = await db
      .select({ id: boardColumn.id })
      .from(boardColumn)
      .where(and(eq(boardColumn.boardId, input.boardId), eq(boardColumn.category, "done")));
    const doneColumnIds = doneColumns.map((c) => c.id);

    // Completed: issues in "done" columns that were moved there (updatedAt) in last 7 days
    let completedCount = 0;
    if (doneColumnIds.length > 0) {
      const [completedResult] = await db
        .select({ value: count() })
        .from(issue)
        .where(and(inArray(issue.columnId, doneColumnIds), gte(issue.updatedAt, sevenDaysAgo)));
      completedCount = completedResult?.value ?? 0;
    }

    // Updated: issues with updatedAt in last 7 days
    const [updatedResult] = await db
      .select({ value: count() })
      .from(issue)
      .where(and(boardFilter, gte(issue.updatedAt, sevenDaysAgo)));

    // Created: issues with createdAt in last 7 days
    const [createdResult] = await db
      .select({ value: count() })
      .from(issue)
      .where(and(boardFilter, gte(issue.createdAt, sevenDaysAgo)));

    // Due soon: issues with dueDate in next 7 days
    const [dueSoonResult] = await db
      .select({ value: count() })
      .from(issue)
      .where(and(boardFilter, gte(issue.dueDate, now), lte(issue.dueDate, sevenDaysFromNow)));

    return {
      completed: completedCount,
      updated: updatedResult?.value ?? 0,
      created: createdResult?.value ?? 0,
      dueSoon: dueSoonResult?.value ?? 0,
    };
  }),

  /**
   * Status overview: issue counts grouped by board column with name and color.
   */
  getStatusOverview: protectedProcedure.input(boardIdInput).query(async ({ ctx, input }) => {
    const { db } = ctx;

    const results = await db
      .select({
        columnId: boardColumn.id,
        name: boardColumn.name,
        color: boardColumn.color,
        count: count(),
      })
      .from(issue)
      .innerJoin(boardColumn, eq(issue.columnId, boardColumn.id))
      .where(eq(boardColumn.boardId, input.boardId))
      .groupBy(boardColumn.id, boardColumn.name, boardColumn.color)
      .orderBy(boardColumn.position);

    const total = results.reduce((sum, r) => sum + r.count, 0);

    return { columns: results, total };
  }),

  /**
   * Recent activity: latest activity entries for issues on this board.
   */
  getRecentActivity: protectedProcedure.input(boardIdInput).query(async ({ ctx, input }) => {
    const { db } = ctx;

    const columnIds = await getBoardColumnIds(db, input.boardId);
    if (columnIds.length === 0) return [];

    const results = await db
      .select({
        id: activity.id,
        action: activity.action,
        field: activity.field,
        oldValue: activity.oldValue,
        newValue: activity.newValue,
        createdAt: activity.createdAt,
        actorName: user.name,
        actorImage: user.image,
        issueKey: issue.key,
        issueTitle: issue.title,
        issueId: issue.id,
      })
      .from(activity)
      .innerJoin(issue, eq(activity.issueId, issue.id))
      .innerJoin(user, eq(activity.actorId, user.id))
      .where(inArray(issue.columnId, columnIds))
      .orderBy(desc(activity.createdAt))
      .limit(15);

    return results;
  }),

  /**
   * Priority breakdown: issue counts grouped by priority.
   */
  getPriorityBreakdown: protectedProcedure.input(boardIdInput).query(async ({ ctx, input }) => {
    const { db } = ctx;

    const columnIds = await getBoardColumnIds(db, input.boardId);
    if (columnIds.length === 0) return [];

    const results = await db
      .select({
        priority: issue.priority,
        count: count(),
      })
      .from(issue)
      .where(inArray(issue.columnId, columnIds))
      .groupBy(issue.priority);

    // Ensure all priorities are represented in a fixed order
    const priorityOrder = ["highest", "high", "medium", "low", "lowest"] as const;
    const priorityMap = new Map(results.map((r) => [r.priority, r.count]));

    return priorityOrder.map((p) => ({
      priority: p,
      count: priorityMap.get(p) ?? 0,
    }));
  }),

  /**
   * Types of work: issue counts grouped by type with percentages.
   */
  getTypesOfWork: protectedProcedure.input(boardIdInput).query(async ({ ctx, input }) => {
    const { db } = ctx;

    const columnIds = await getBoardColumnIds(db, input.boardId);
    if (columnIds.length === 0) return [];

    const results = await db
      .select({
        type: issue.type,
        count: count(),
      })
      .from(issue)
      .where(inArray(issue.columnId, columnIds))
      .groupBy(issue.type);

    const total = results.reduce((sum, r) => sum + r.count, 0);

    // Fixed display order
    const typeOrder = ["story", "epic", "task", "bug", "subtask"] as const;
    const typeMap = new Map(results.map((r) => [r.type, r.count]));

    return typeOrder
      .map((t) => {
        const cnt = typeMap.get(t) ?? 0;
        return {
          type: t,
          count: cnt,
          percentage: total > 0 ? Math.round((cnt / total) * 100) : 0,
        };
      })
      .filter((t) => t.count > 0);
  }),

  /**
   * Team workload: issue counts grouped by assignee.
   */
  getTeamWorkload: protectedProcedure.input(boardIdInput).query(async ({ ctx, input }) => {
    const { db } = ctx;

    const columnIds = await getBoardColumnIds(db, input.boardId);
    if (columnIds.length === 0) return [];

    // Assigned issues
    const assignedResults = await db
      .select({
        assigneeId: issue.assigneeId,
        name: user.name,
        image: user.image,
        count: count(),
      })
      .from(issue)
      .innerJoin(user, eq(issue.assigneeId, user.id))
      .where(inArray(issue.columnId, columnIds))
      .groupBy(issue.assigneeId, user.name, user.image)
      .orderBy(desc(count()));

    // Unassigned issues
    const [unassignedResult] = await db
      .select({ count: count() })
      .from(issue)
      .where(and(inArray(issue.columnId, columnIds), isNull(issue.assigneeId)));

    const unassignedCount = unassignedResult?.count ?? 0;
    const total = assignedResults.reduce((sum, r) => sum + r.count, 0) + unassignedCount;

    const members: {
      assigneeId: string | null;
      name: string;
      image: string | null;
      count: number;
      percentage: number;
    }[] = assignedResults.map((r) => ({
      assigneeId: r.assigneeId,
      name: r.name,
      image: r.image,
      count: r.count,
      percentage: total > 0 ? Math.round((r.count / total) * 100) : 0,
    }));

    // Prepend unassigned if any
    if (unassignedCount > 0) {
      members.unshift({
        assigneeId: null,
        name: "Unassigned",
        image: null,
        count: unassignedCount,
        percentage: total > 0 ? Math.round((unassignedCount / total) * 100) : 0,
      });
    }

    return members;
  }),

  /**
   * Epic progress: child issue completion per epic on this board.
   */
  getEpicProgress: protectedProcedure.input(boardIdInput).query(async ({ ctx, input }) => {
    const { db } = ctx;

    const columnIds = await getBoardColumnIds(db, input.boardId);
    if (columnIds.length === 0) return [];

    // Get epics on this board
    const epics = await db
      .select({
        id: issue.id,
        key: issue.key,
        title: issue.title,
      })
      .from(issue)
      .where(and(inArray(issue.columnId, columnIds), eq(issue.type, "epic")));

    if (epics.length === 0) return [];

    // For each epic, count children by column category
    const epicProgress = await Promise.all(
      epics.map(async (epic) => {
        const children = await db
          .select({
            category: boardColumn.category,
            count: count(),
          })
          .from(issue)
          .leftJoin(boardColumn, eq(issue.columnId, boardColumn.id))
          .where(eq(issue.parentId, epic.id))
          .groupBy(boardColumn.category);

        const categoryMap = new Map(children.map((c) => [c.category, c.count]));
        const done = categoryMap.get("done") ?? 0;
        const inProgress = categoryMap.get("in_progress") ?? 0;
        const todo = categoryMap.get("todo") ?? 0;
        // Children with null category (no column) count as todo
        const noColumn = categoryMap.get(null) ?? 0;
        const totalChildren = done + inProgress + todo + noColumn;

        return {
          id: epic.id,
          key: epic.key,
          title: epic.title,
          done,
          inProgress,
          todo: todo + noColumn,
          total: totalChildren,
          percentage: totalChildren > 0 ? Math.round((done / totalChildren) * 100) : 0,
        };
      })
    );

    return epicProgress.filter((e) => e.total > 0);
  }),
});
