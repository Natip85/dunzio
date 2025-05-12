import { TRPCError } from "@trpc/server";

import { eq } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { tasks } from "@/server/db/schema";
import { z } from "zod";
import { taskCreateSelectSchema, taskSelectSchema } from "./task-types";

export const taskRouter = createTRPCRouter({
  byId: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
    const data = await ctx.db.query.tasks.findFirst({
      where: eq(tasks.id, input),
      with: {
        createdBy: true,
        comments: true,
      },
    });
    return data;
  }),
  updateTaskColumn: protectedProcedure
    .input(z.object({ taskId: z.number(), columnId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.db
        .update(tasks)
        .set({ columnId: input.columnId })
        .where(eq(tasks.id, input.taskId))
        .returning();
      if (!updated) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong updating task",
        });
      }
      return updated[0];
    }),
  create: protectedProcedure
    .input(taskCreateSelectSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return ctx.db.transaction(async (tx) => {
        const { title, description, projectId, columnId } = input;
        if (!input.columnId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Column not found",
          });
        }

        const [newTask] = await tx
          .insert(tasks)
          .values({
            title,
            description,
            projectId,
            columnId,
            createdBy: ctx.session.user.id,
          })
          .returning();

        if (!newTask) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Task creation failed",
          });
        }

        return newTask.id;
      });
    }),
  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const updated = await ctx.db
        .delete(tasks)
        .where(eq(tasks.id, input))
        .returning();

      if (!updated[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tasks not found or update failed",
        });
      }

      return updated[0];
    }),
  editTitle: protectedProcedure
    .input(taskSelectSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const updated = await ctx.db
        .update(tasks)
        .set({ title: input.title })
        .where(eq(tasks.id, input.id))
        .returning();

      if (!updated[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task title not found or update failed",
        });
      }

      return updated[0];
    }),
  editDescription: protectedProcedure
    .input(taskSelectSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const updated = await ctx.db
        .update(tasks)
        .set({ description: input.description })
        .where(eq(tasks.id, input.id))
        .returning();

      if (!updated[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task title not found or update failed",
        });
      }

      return updated[0];
    }),
});
