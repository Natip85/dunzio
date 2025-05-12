import { eq, desc } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { comments } from "@/server/db/schema";
import { commentCreateSelectSchema } from "./comment-types";
import { TRPCError } from "@trpc/server";

export const commentRouter = createTRPCRouter({
  byId: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
    const data = await ctx.db.query.columns.findFirst({
      where: eq(comments.id, input),
    });
    return data;
  }),
  create: protectedProcedure
    .input(commentCreateSelectSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return ctx.db.transaction(async (tx) => {
        const { content, taskId } = input;
        if (!input.content) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Text not found",
          });
        }

        const [newComment] = await tx
          .insert(comments)
          .values({
            content,
            userId: ctx.session.user.id,
            taskId,
          })
          .returning();

        if (!newComment) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Comment creation failed",
          });
        }

        return newComment.id;
      });
    }),
  getAllByTask: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return await ctx.db.query.comments.findMany({
        where: eq(comments.taskId, input),
        with: { user: true },
        orderBy: desc(comments.createdAt),
      });
    }),
});
