import { TRPCError } from "@trpc/server";
import { and, eq, gt, inArray, sql } from "drizzle-orm";
import { z } from "zod";

import { member, user } from "@dunzio/db/schema/auth";
import { board, boardColumn, issue, project } from "@dunzio/db/schema/projects";
import { columnSchema, deleteProjectSchema, updateProjectSchema } from "@dunzio/db/validators";

import { createTRPCRouter, protectedProcedure } from "../trpc";

/**
 * Generate a project key from the project name.
 * Examples:
 * - "My Project" -> "MYPR"
 * - "Backend API" -> "BEAP"
 * - "UI" -> "UI"
 */
function generateProjectKey(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  if (words.length === 0) {
    return "PROJ";
  }

  const firstWord = words[0];
  const secondWord = words[1];

  if (words.length === 1 && firstWord) {
    // Single word: take first 4 characters uppercase
    return firstWord.substring(0, 4).toUpperCase();
  }

  // Multiple words: take first 2 chars of first two words
  if (firstWord && secondWord) {
    return (firstWord.substring(0, 2) + secondWord.substring(0, 2)).toUpperCase();
  }

  return "PROJ";
}

export const projectRouter = createTRPCRouter({
  /**
   * List all projects with their boards for the active organization.
   * Used by the sidebar to render the project/board tree.
   */
  listProjectsWithBoards: protectedProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;
    const orgId = session.session.activeOrganizationId;

    if (!orgId) {
      return [];
    }

    return db.query.project.findMany({
      where: eq(project.organizationId, orgId),
      orderBy: (p, { desc }) => [desc(p.updatedAt)],
      with: {
        boards: {
          orderBy: (b, { asc }) => [asc(b.createdAt)],
        },
      },
    });
  }),

  /**
   * Create a new project with a default board and columns.
   * Used during onboarding to set up the user's first project.
   */
  createWithBoard: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        columns: z.array(columnSchema).min(1).max(20),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session, db } = ctx;

      // Get the active organization from the session
      const organizationId = session.session.activeOrganizationId;

      if (!organizationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No active organization. Please create an organization first.",
        });
      }

      // Generate a unique project key
      let projectKey = generateProjectKey(input.name);
      let keyAttempt = 0;

      // Check if key exists and append number if needed
      while (true) {
        const existingProject = await db.query.project.findFirst({
          where: (p, { and, eq }) =>
            and(eq(p.organizationId, organizationId), eq(p.key, projectKey)),
        });

        if (!existingProject) break;

        keyAttempt++;
        projectKey = `${generateProjectKey(input.name)}${keyAttempt}`;

        if (keyAttempt > 99) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Unable to generate unique project key",
          });
        }
      }

      // Create project, board, and columns in a transaction
      const result = await db.transaction(async (tx) => {
        // Create the project
        const [newProject] = await tx
          .insert(project)
          .values({
            organizationId,
            name: input.name,
            key: projectKey,
            leadId: session.user.id,
          })
          .returning();

        if (!newProject) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create project",
          });
        }

        // Create the default board
        const [newBoard] = await tx
          .insert(board)
          .values({
            projectId: newProject.id,
            name: "Main Board",
            isDefault: true,
          })
          .returning();

        if (!newBoard) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create board",
          });
        }

        // Create the columns
        const columnValues = input.columns.map((col, index) => ({
          boardId: newBoard.id,
          name: col.name,
          category: col.category,
          color: col.color ?? "#6B7280",
          position: index,
        }));

        const newColumns = await tx.insert(boardColumn).values(columnValues).returning();

        return {
          project: newProject,
          board: newBoard,
          columns: newColumns,
        };
      });

      return result;
    }),

  /**
   * Get the default board with its columns for a project.
   * Used to render the kanban view.
   */
  getBoardWithColumns: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;

      const boardData = await db.query.board.findFirst({
        where: (b, { and, eq }) => and(eq(b.projectId, input.projectId), eq(b.isDefault, true)),
        with: {
          columns: {
            orderBy: (c, { asc }) => [asc(c.position)],
          },
        },
      });

      return boardData;
    }),

  /**
   * Reorder columns in a board.
   * Updates position for each column based on array index.
   */
  reorderColumns: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        columnIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      // Verify board exists
      const boardData = await db.query.board.findFirst({
        where: eq(board.id, input.boardId),
      });

      if (!boardData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Board not found",
        });
      }

      // Verify all columns belong to this board
      const existingColumns = await db.query.boardColumn.findMany({
        where: inArray(boardColumn.id, input.columnIds),
      });

      const allBelongToBoard = existingColumns.every((col) => col.boardId === input.boardId);
      if (!allBelongToBoard || existingColumns.length !== input.columnIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid column IDs provided",
        });
      }

      // Update positions in a transaction
      await db.transaction(async (tx) => {
        for (let i = 0; i < input.columnIds.length; i++) {
          const columnId = input.columnIds[i];
          if (columnId) {
            await tx.update(boardColumn).set({ position: i }).where(eq(boardColumn.id, columnId));
          }
        }
      });

      return { success: true };
    }),

  /**
   * Delete a column from a board.
   * If the column has tasks and a target column is provided, tasks will be moved first.
   */
  deleteColumn: protectedProcedure
    .input(
      z.object({
        columnId: z.string(),
        moveTasksToColumnId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      // Get the column to delete
      const columnToDelete = await db.query.boardColumn.findFirst({
        where: eq(boardColumn.id, input.columnId),
      });

      if (!columnToDelete) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Column not found",
        });
      }

      // Check if the column has tasks
      const tasksInColumn = await db.query.issue.findMany({
        where: eq(issue.columnId, input.columnId),
      });

      if (tasksInColumn.length > 0) {
        if (!input.moveTasksToColumnId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Column has tasks. Please provide a target column to move them to.",
          });
        }

        // Verify target column exists and belongs to the same board
        const targetColumn = await db.query.boardColumn.findFirst({
          where: eq(boardColumn.id, input.moveTasksToColumnId),
        });

        if (!targetColumn) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Target column not found",
          });
        }

        if (targetColumn.boardId !== columnToDelete.boardId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Target column must belong to the same board",
          });
        }
      }

      // Perform the deletion in a transaction
      await db.transaction(async (tx) => {
        // If there are tasks and a target column, move them first
        if (tasksInColumn.length > 0 && input.moveTasksToColumnId) {
          // Get the max position in the target column
          const lastTaskInTarget = await tx.query.issue.findFirst({
            where: eq(issue.columnId, input.moveTasksToColumnId),
            orderBy: (i, { desc }) => [desc(i.position)],
          });

          const startPosition = (lastTaskInTarget?.position ?? -1) + 1;

          // Move tasks to target column, updating positions
          for (let i = 0; i < tasksInColumn.length; i++) {
            const task = tasksInColumn[i];
            if (task) {
              await tx
                .update(issue)
                .set({
                  columnId: input.moveTasksToColumnId,
                  position: startPosition + i,
                })
                .where(eq(issue.id, task.id));
            }
          }
        }

        // Delete the column
        await tx.delete(boardColumn).where(eq(boardColumn.id, input.columnId));

        // Reorder remaining columns to close the gap
        await tx
          .update(boardColumn)
          .set({ position: sql`${boardColumn.position} - 1` })
          .where(
            and(
              eq(boardColumn.boardId, columnToDelete.boardId),
              gt(boardColumn.position, columnToDelete.position)
            )
          );
      });

      return { success: true };
    }),

  /**
   * Create a new column in a board.
   * Position is auto-calculated as the last position + 1.
   */
  createColumn: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        name: z.string().min(1, "Name is required").max(50, "Name is too long"),
        description: z.string().max(200).optional(),
        color: z
          .string()
          .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
          .default("#6B7280"),
        category: z.enum(["todo", "in_progress", "done"]).default("todo"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      // Verify board exists
      const boardData = await db.query.board.findFirst({
        where: eq(board.id, input.boardId),
      });

      if (!boardData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Board not found",
        });
      }

      // Get the max position in the board
      const lastColumn = await db.query.boardColumn.findFirst({
        where: eq(boardColumn.boardId, input.boardId),
        orderBy: (c, { desc }) => [desc(c.position)],
      });

      const newPosition = (lastColumn?.position ?? -1) + 1;

      // Create the column
      const [newColumn] = await db
        .insert(boardColumn)
        .values({
          boardId: input.boardId,
          name: input.name,
          description: input.description,
          color: input.color,
          category: input.category,
          position: newPosition,
        })
        .returning();

      if (!newColumn) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create column",
        });
      }

      return newColumn;
    }),

  /**
   * Update an existing column's properties (name, description, color, category).
   */
  updateColumn: protectedProcedure
    .input(
      z.object({
        columnId: z.string(),
        name: z.string().min(1, "Name is required").max(50, "Name is too long").optional(),
        description: z.string().max(200, "Description is too long").optional(),
        color: z
          .string()
          .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
          .optional(),
        category: z.enum(["todo", "in_progress", "done"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      // Verify column exists
      const existingColumn = await db.query.boardColumn.findFirst({
        where: eq(boardColumn.id, input.columnId),
      });

      if (!existingColumn) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Column not found",
        });
      }

      // Build update object with only provided fields
      const updateData: Partial<typeof boardColumn.$inferInsert> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.color !== undefined) updateData.color = input.color;
      if (input.category !== undefined) updateData.category = input.category;

      const [updatedColumn] = await db
        .update(boardColumn)
        .set(updateData)
        .where(eq(boardColumn.id, input.columnId))
        .returning();

      if (!updatedColumn) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update column",
        });
      }

      return updatedColumn;
    }),

  // ============================================================================
  // BOARD CRUD
  // ============================================================================

  /**
   * List all boards for a project.
   */
  listBoards: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;

      // Verify project exists
      const projectData = await db.query.project.findFirst({
        where: eq(project.id, input.projectId),
      });

      if (!projectData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const boards = await db.query.board.findMany({
        where: eq(board.projectId, input.projectId),
        orderBy: (b, { asc }) => [asc(b.createdAt)],
        with: {
          columns: {
            orderBy: (c, { asc }) => [asc(c.position)],
          },
        },
      });

      return boards;
    }),

  /**
   * Get a specific board with its columns.
   */
  getBoard: protectedProcedure
    .input(z.object({ boardId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;

      const boardData = await db.query.board.findFirst({
        where: eq(board.id, input.boardId),
        with: {
          columns: {
            orderBy: (c, { asc }) => [asc(c.position)],
          },
          project: true,
        },
      });

      if (!boardData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Board not found",
        });
      }

      return boardData;
    }),

  /**
   * Create a new board with default columns.
   */
  createBoard: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        name: z.string().min(1, "Name is required").max(100, "Name is too long"),
        description: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      // Verify project exists
      const projectData = await db.query.project.findFirst({
        where: eq(project.id, input.projectId),
      });

      if (!projectData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      // Create board with default columns in a transaction
      const result = await db.transaction(async (tx) => {
        // Check if this is the first board (should be default)
        const existingBoards = await tx.query.board.findMany({
          where: eq(board.projectId, input.projectId),
        });

        const isFirstBoard = existingBoards.length === 0;

        // Create the board
        const [newBoard] = await tx
          .insert(board)
          .values({
            projectId: input.projectId,
            name: input.name,
            description: input.description,
            isDefault: isFirstBoard,
          })
          .returning();

        if (!newBoard) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create board",
          });
        }

        // Create default columns
        const defaultColumns = [
          { name: "To Do", category: "todo" as const, color: "#6B7280", position: 0 },
          { name: "In Progress", category: "in_progress" as const, color: "#3B82F6", position: 1 },
          { name: "Done", category: "done" as const, color: "#22C55E", position: 2 },
        ];

        const columnValues = defaultColumns.map((col) => ({
          boardId: newBoard.id,
          ...col,
        }));

        const newColumns = await tx.insert(boardColumn).values(columnValues).returning();

        return {
          board: newBoard,
          columns: newColumns,
        };
      });

      return result;
    }),

  /**
   * Update a board's name or description.
   */
  updateBoard: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        name: z.string().min(1, "Name is required").max(100, "Name is too long").optional(),
        description: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      // Verify board exists
      const existingBoard = await db.query.board.findFirst({
        where: eq(board.id, input.boardId),
      });

      if (!existingBoard) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Board not found",
        });
      }

      // Update board
      const [updatedBoard] = await db
        .update(board)
        .set({
          ...(input.name && { name: input.name }),
          ...(input.description !== undefined && { description: input.description }),
        })
        .where(eq(board.id, input.boardId))
        .returning();

      return updatedBoard;
    }),

  /**
   * Delete a board.
   * Cannot delete the last board in a project.
   * Issues in this board's columns will have their columnId set to null.
   */
  deleteBoard: protectedProcedure
    .input(z.object({ boardId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      // Get the board to delete
      const boardToDelete = await db.query.board.findFirst({
        where: eq(board.id, input.boardId),
      });

      if (!boardToDelete) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Board not found",
        });
      }

      // Check if this is the last board in the project
      const boardCount = await db.query.board.findMany({
        where: eq(board.projectId, boardToDelete.projectId),
      });

      if (boardCount.length <= 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete the last board in a project",
        });
      }

      // Delete the board (cascade will handle columns, issues will have columnId set to null)
      await db.delete(board).where(eq(board.id, input.boardId));

      // If the deleted board was the default, make another board the default
      if (boardToDelete.isDefault) {
        const newDefaultBoard = await db.query.board.findFirst({
          where: eq(board.projectId, boardToDelete.projectId),
        });

        if (newDefaultBoard) {
          await db.update(board).set({ isDefault: true }).where(eq(board.id, newDefaultBoard.id));
        }
      }

      return { success: true };
    }),

  // ============================================================================
  // PROJECT CRUD
  // ============================================================================

  /**
   * Update a project's name or description.
   */
  updateProject: protectedProcedure.input(updateProjectSchema).mutation(async ({ ctx, input }) => {
    const { db, session } = ctx;

    // Verify project exists and belongs to user's organization
    const existingProject = await db.query.project.findFirst({
      where: eq(project.id, input.projectId),
    });

    if (!existingProject) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Project not found",
      });
    }

    // Verify user has access to this project's organization
    if (existingProject.organizationId !== session.session.activeOrganizationId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to update this project",
      });
    }

    // Update project
    const [updatedProject] = await db
      .update(project)
      .set({
        ...(input.name && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
      })
      .where(eq(project.id, input.projectId))
      .returning();

    return updatedProject;
  }),

  /**
   * Delete a project.
   * This will cascade delete all boards, columns, and issues in the project.
   */
  deleteProject: protectedProcedure.input(deleteProjectSchema).mutation(async ({ ctx, input }) => {
    const { db, session } = ctx;

    // Verify project exists
    const existingProject = await db.query.project.findFirst({
      where: eq(project.id, input.projectId),
    });

    if (!existingProject) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Project not found",
      });
    }

    // Verify user has access to this project's organization
    if (existingProject.organizationId !== session.session.activeOrganizationId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to delete this project",
      });
    }

    // Delete the project (cascade will handle boards, columns, and issues)
    await db.delete(project).where(eq(project.id, input.projectId));

    return { success: true, deletedProject: existingProject };
  }),

  /**
   * Get all members of a project's organization.
   * Used for assignee selection in task forms and filters.
   */
  getProjectMembers: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;

      // Get the project to find its organization
      const projectData = await db.query.project.findFirst({
        where: eq(project.id, input.projectId),
      });

      if (!projectData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      // Get all members of the organization with their user data
      const members = await db
        .select({
          id: user.id,
          name: user.name,
          image: user.image,
        })
        .from(member)
        .innerJoin(user, eq(member.userId, user.id))
        .where(eq(member.organizationId, projectData.organizationId));

      return members;
    }),
});
