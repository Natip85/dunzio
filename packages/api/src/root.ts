import { onboardingRouter } from "./routers/onboarding";
import { organizationRouter } from "./routers/organization";
import { projectRouter } from "./routers/project";
import { taskRouter } from "./routers/task";
import { userRouter } from "./routers/user";
import { createCallerFactory, createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  user: userRouter,
  project: projectRouter,
  onboarding: onboardingRouter,
  organization: organizationRouter,
  task: taskRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.product.all();
 *       ^? Product[]
 */
export const createCaller = createCallerFactory(appRouter);
