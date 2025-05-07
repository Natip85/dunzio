import { authRouter } from "@/features/auth/auth-router";
import { columnRouter } from "@/features/columns/column-router";
import { projectRouter } from "@/features/projects/project-router";
import { taskRouter } from "@/features/tasks/task-router";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  project: projectRouter,
  column: columnRouter,
  task: taskRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
