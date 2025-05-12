import { TRPCError } from "@trpc/server";

import { eq, desc } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { projectSelectSchema } from "./project-types";
import { columns, projects } from "@/server/db/schema";
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
        cols: {
          with: {
            colTasks: { with: { createdBy: true, comments: true } },
          },
        },
      },
    });
    if (data?.userId !== ctx.session.user.id) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return data;
  }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return await ctx.db.query.projects.findMany({
      orderBy: desc(projects.createdAt),
    });
  }),
});
