import { eq } from "drizzle-orm";
import { z } from "zod";

import { member as memberTable, organization as orgTable } from "@dunzio/db/schema/auth";
import { board, boardColumn, project } from "@dunzio/db/schema/projects";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const columnCategorySchema = z.enum(["todo", "in_progress", "done"]);

export const columnSchema = z.object({
  id: z.string().optional(), // Optional for new columns
  name: z.string().min(1, "Column name is required").max(50, "Column name is too long"),
  category: columnCategorySchema,
});

export type ColumnInput = z.infer<typeof columnSchema>;
export type ColumnCategory = z.infer<typeof columnCategorySchema>;

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
    return firstWord.substring(0, 4).toUpperCase();
  }

  if (firstWord && secondWord) {
    return (firstWord.substring(0, 2) + secondWord.substring(0, 2)).toUpperCase();
  }

  return "PROJ";
}

export const onboardingRouter = createTRPCRouter({
  /**
   * Get the current onboarding status for the user.
   * Returns which step they're on and any existing data.
   * Also returns info about all user's organizations for multi-org handling.
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const { session, db } = ctx;
    const userId = session.user.id;

    // Get all user memberships to check for multi-org scenario
    const allMemberships = await db
      .select()
      .from(memberTable)
      .where(eq(memberTable.userId, userId));

    const totalOrganizations = allMemberships.length;

    // Check how many orgs have completed onboarding (have projects with boards)
    let completedOrganizations = 0;
    for (const membership of allMemberships) {
      const hasProject = await db.query.project.findFirst({
        where: (p, { eq }) => eq(p.organizationId, membership.organizationId),
        with: {
          boards: {
            where: (b, { eq }) => eq(b.isDefault, true),
            with: {
              columns: true,
            },
            limit: 1,
          },
        },
      });

      if (hasProject?.boards?.[0]?.columns && hasProject.boards[0].columns.length > 0) {
        completedOrganizations++;
      }
    }

    // First, check for active organization from session
    let organizationId = session.session.activeOrganizationId;

    // If no active org, check if user belongs to any organizations
    if (!organizationId) {
      // Find user's first membership
      const [userMembership] = await db
        .select()
        .from(memberTable)
        .where(eq(memberTable.userId, userId))
        .orderBy(memberTable.createdAt)
        .limit(1);

      if (userMembership) {
        // Get the organization details
        const [userOrg] = await db
          .select()
          .from(orgTable)
          .where(eq(orgTable.id, userMembership.organizationId));

        if (userOrg) {
          // User has an org but it's not set as active
          // Return the org info so the client can set it as active
          const existingOrgId = userOrg.id;
          organizationId = existingOrgId;

          // Check for existing project in this organization
          const existingProject = await db.query.project.findFirst({
            where: (p, { eq }) => eq(p.organizationId, existingOrgId),
            with: {
              boards: {
                where: (b, { eq }) => eq(b.isDefault, true),
                with: {
                  columns: {
                    orderBy: (c, { asc }) => [asc(c.position)],
                  },
                },
                limit: 1,
              },
            },
          });

          if (!existingProject) {
            return {
              step: "project",
              organization: userOrg,
              organizationNeedsActivation: true,
              project: null,
              board: null,
              columns: null,
              totalOrganizations,
              completedOrganizations,
            };
          }

          const defaultBoard = existingProject.boards[0];

          // If board has columns, onboarding is complete
          const hasColumns = defaultBoard?.columns && defaultBoard.columns.length > 0;

          return {
            step: hasColumns ? "complete" : "columns",
            organization: userOrg,
            organizationNeedsActivation: true,
            project: existingProject,
            board: defaultBoard ?? null,
            columns: defaultBoard?.columns ?? null,
            totalOrganizations,
            completedOrganizations,
          };
        }
      }

      // User has no organizations at all
      return {
        step: "organization",
        organization: null,
        organizationNeedsActivation: false,
        project: null,
        board: null,
        columns: null,
        totalOrganizations,
        completedOrganizations,
      };
    }

    // Active organization exists - check for project
    const existingProject = await db.query.project.findFirst({
      where: (p, { eq }) => eq(p.organizationId, organizationId),
      with: {
        boards: {
          where: (b, { eq }) => eq(b.isDefault, true),
          with: {
            columns: {
              orderBy: (c, { asc }) => [asc(c.position)],
            },
          },
          limit: 1,
        },
      },
    });

    // Also get the organization details
    const org = await db.query.organization.findFirst({
      where: (o, { eq }) => eq(o.id, organizationId),
    });

    if (!existingProject) {
      return {
        step: "project" as const,
        organization: org ?? { id: organizationId },
        organizationNeedsActivation: false,
        project: null,
        board: null,
        columns: null,
        totalOrganizations,
        completedOrganizations,
      };
    }

    const defaultBoard = existingProject.boards[0];

    if (!defaultBoard) {
      return {
        step: "project" as const,
        organization: org ?? { id: organizationId },
        organizationNeedsActivation: false,
        project: existingProject,
        board: null,
        columns: null,
        totalOrganizations,
        completedOrganizations,
      };
    }

    // Project and board exist - check if columns exist
    const hasColumns = defaultBoard.columns && defaultBoard.columns.length > 0;

    return {
      step: hasColumns ? "complete" : "columns",
      organization: org ?? { id: organizationId },
      organizationNeedsActivation: false,
      project: existingProject,
      board: defaultBoard,
      columns: defaultBoard.columns,
      totalOrganizations,
      completedOrganizations,
    };
  }),

  /**
   * Step 2: Create a project with a board (no columns yet).
   * Columns are created in step 3 when user finalizes them.
   */
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Project name is required").max(100, "Project name is too long"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session, db } = ctx;
      const organizationId = session.session.activeOrganizationId;

      if (!organizationId) {
        throw new Error("No active organization. Please create an organization first.");
      }

      // Check if project already exists (idempotency)
      const existingProject = await db.query.project.findFirst({
        where: (p, { eq }) => eq(p.organizationId, organizationId),
      });

      if (existingProject) {
        // Return existing project with its board
        const existingBoard = await db.query.board.findFirst({
          where: (b, { and, eq }) =>
            and(eq(b.projectId, existingProject.id), eq(b.isDefault, true)),
        });

        return {
          project: existingProject,
          board: existingBoard,
        };
      }

      // Generate unique project key
      let projectKey = generateProjectKey(input.name);
      let keyAttempt = 0;

      while (true) {
        const existingKey = await db.query.project.findFirst({
          where: (p, { and, eq }) =>
            and(eq(p.organizationId, organizationId), eq(p.key, projectKey)),
        });

        if (!existingKey) break;

        keyAttempt++;
        projectKey = `${generateProjectKey(input.name)}${keyAttempt}`;

        if (keyAttempt > 99) {
          throw new Error("Unable to generate unique project key");
        }
      }

      // Create project, board, and default columns in a transaction
      const result = await db.transaction(async (tx) => {
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
          throw new Error("Failed to create project");
        }

        const [newBoard] = await tx
          .insert(board)
          .values({
            projectId: newProject.id,
            name: "Main Board",
            isDefault: true,
          })
          .returning();

        if (!newBoard) {
          throw new Error("Failed to create board");
        }

        // Don't create columns yet - user will customize them in step 3
        return {
          project: newProject,
          board: newBoard,
        };
      });

      return result;
    }),

  /**
   * Step 3: Create/update board columns.
   * Creates columns on first call, replaces all columns on subsequent calls.
   * This finalizes the onboarding process.
   */
  updateColumns: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        columns: z
          .array(columnSchema)
          .min(1, "At least one column is required")
          .max(20, "Maximum 20 columns allowed"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      // Verify board exists
      const existingBoard = await db.query.board.findFirst({
        where: (b, { eq }) => eq(b.id, input.boardId),
      });

      if (!existingBoard) {
        throw new Error("Board not found");
      }

      // Delete existing columns and insert new ones
      const result = await db.transaction(async (tx) => {
        // Delete all existing columns for this board
        await tx.delete(boardColumn).where(eq(boardColumn.boardId, input.boardId));

        // Insert new columns
        const columnValues = input.columns.map((col, index) => ({
          boardId: input.boardId,
          name: col.name,
          category: col.category,
          color: "#6B7280",
          position: index,
        }));

        const newColumns = await tx.insert(boardColumn).values(columnValues).returning();

        return newColumns;
      });

      return { columns: result };
    }),

  /**
   * Complete onboarding - just returns the project to redirect to.
   * Called after columns are finalized.
   */
  complete: protectedProcedure.query(async ({ ctx }) => {
    const { session, db } = ctx;
    const organizationId = session.session.activeOrganizationId;

    if (!organizationId) {
      throw new Error("No active organization");
    }

    const existingProject = await db.query.project.findFirst({
      where: (p, { eq }) => eq(p.organizationId, organizationId),
    });

    if (!existingProject) {
      throw new Error("No project found. Please complete onboarding first.");
    }

    return { project: existingProject };
  }),
});
