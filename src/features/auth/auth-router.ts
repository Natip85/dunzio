import { TRPCError } from "@trpc/server";
import { asc, eq } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { user as userTable } from "@/server/db/schema";

export const authRouter = createTRPCRouter({
  getMe: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const user = await ctx.db.query.user.findFirst({
      where: eq(userTable.id, ctx.session.user.id),
      columns: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return user;
  }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const users = await ctx.db.query.user.findMany({
      orderBy: asc(userTable.name),
    });
    if (!users) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "No users found",
      });
    }
    return users;
  }),
});
