import { TRPCError } from "@trpc/server";

import { eq } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { tasks } from "@/server/db/schema";
import { z } from "zod";

export const taskRouter = createTRPCRouter({
  byId: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
    const data = await ctx.db.query.tasks.findFirst({
      where: eq(tasks.id, input),
      with: {},
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
});
