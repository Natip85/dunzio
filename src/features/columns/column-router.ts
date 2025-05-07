import { TRPCError } from "@trpc/server";

import { eq, count } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { columns } from "@/server/db/schema";
import { z } from "zod";
import { columnCreateSelectSchema } from "./column-types";

export const columnRouter = createTRPCRouter({
  byId: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
    const data = await ctx.db.query.columns.findFirst({
      where: eq(columns.id, input),
      with: {
        project: true,
        colTasks: true,
      },
    });
    return data;
  }),
  updateColumnPositions: protectedProcedure
    .input(z.array(z.object({ id: z.number(), position: z.number() })))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction(async (tx) => {
        for (const { id, position } of input) {
          await tx.update(columns).set({ position }).where(eq(columns.id, id));
        }
      });
    }),
  create: protectedProcedure
    .input({ ...columnCreateSelectSchema, projectId: z.number() })
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return ctx.db.transaction(async (tx) => {
        const { name, description, projectId } = input;
        if (!input.projectId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found",
          });
        }
        const existing = await tx
          .select({ count: count() })
          .from(columns)
          .where(eq(columns.projectId, input.projectId));

        const newPosition = existing[0]?.count;

        const [newColumn] = await tx
          .insert(columns)
          .values({ name, description, position: newPosition, projectId })
          .returning();

        if (!newColumn) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Column creation failed",
          });
        }

        return newColumn.id;
      });
    }),
});
