import { TRPCError } from "@trpc/server";

import { eq, and, desc } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { projectSelectSchema } from "./project-types";
import { columns, projectMembers, projects } from "@/server/db/schema";
import { z } from "zod";

export const projectRouter = createTRPCRouter({
  create: protectedProcedure
    .input(projectSelectSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return ctx.db.transaction(async (tx) => {
        const userId = ctx.session.user.id;
        const { name } = input;

        const [newProject] = await tx
          .insert(projects)
          .values({ name, userId })
          .returning();

        if (!newProject) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Product creation failed",
          });
        }

        await tx.insert(columns).values([
          {
            projectId: newProject.id,
            name: "Todo",
            description: "Tasks that haven't been started yet",
            color: "#22C55E",
          },
          {
            projectId: newProject.id,
            name: "In Progress",
            description: "Tasks actively being worked on",
            color: "#EAB308",
          },
          {
            projectId: newProject.id,
            name: "Done",
            description: "Tasks that have been completed",
            color: "#8B5CF6",
          },
        ]);
        return newProject.id;
      });
    }),
  byId: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
    if (!ctx.session.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const data = await ctx.db.query.projects.findFirst({
      where: eq(projects.id, input),
      with: {
        members: {
          with: {
            user: true,
          },
        },
        cols: {
          with: {
            colTasks: { with: { createdBy: true, comments: true } },
          },
        },
      },
    });

    if (!data) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
    }

    const isOwner = data.userId === ctx.session.user.id;
    const isMember = data.members.some(
      (member) => member.user.id === ctx.session.user.id,
    );

    if (!isOwner && !isMember) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return data;
  }),

  getAllByUser: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return await ctx.db.query.projects.findMany({
      orderBy: desc(projects.createdAt),
      where: eq(projects.userId, ctx.session.user.id),
    });
  }),
  update: protectedProcedure
    .input(projectSelectSchema)
    .mutation(async ({ ctx, input }) => {
      const { name, id } = input;
      const updated = await ctx.db
        .update(projects)
        .set({ name })
        .where(eq(projects.id, id))
        .returning();
      if (!updated) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong updating project",
        });
      }
      return updated[0];
    }),
  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const project = await ctx.db.query.projects.findFirst({
        where: eq(projects.id, input),
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      if (project.userId !== userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You do not have permission to delete this project",
        });
      }

      await ctx.db.delete(projects).where(eq(projects.id, input));

      return { success: true };
    }),
  addMember: protectedProcedure
    .input(
      z.object({
        email: z.string(),
        name: z.string(),
        projectId: z.number(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return ctx.db.transaction(async (tx) => {
        const ownerId = ctx.session.user.id;
        const { name, email, projectId, userId } = input;

        const existing = await tx.query.projectMembers.findFirst({
          where: (pm, { eq, and }) =>
            and(eq(pm.projectId, projectId), eq(pm.userId, userId)),
        });

        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "User is already a member of this project",
          });
        }

        const [newMember] = await tx
          .insert(projectMembers)
          .values({ projectId, userId, invitedBy: ownerId })
          .returning();

        if (!newMember) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Adding new member failed",
          });
        }

        return newMember.id;
      });
    }),
  projectMembers: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const data = await ctx.db.query.projectMembers.findMany({
        where: eq(projectMembers.projectId, input),
        with: {
          user: true,
        },
      });

      return data;
    }),
  removeMember: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const { projectId, userId } = input;

      const deleted = await ctx.db
        .delete(projectMembers)
        .where(
          and(
            eq(projectMembers.projectId, projectId),
            eq(projectMembers.userId, userId),
          ),
        );

      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User is not a member of this project",
        });
      }

      return { success: true };
    }),
});
