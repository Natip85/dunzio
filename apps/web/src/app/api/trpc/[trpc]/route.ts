import type { NextRequest } from "next/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter, createTRPCContext } from "@dunzio/api";
import { auth } from "@dunzio/auth";

function handler(req: NextRequest) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      const session = await auth.api.getSession({
        headers: req.headers,
      });
      return createTRPCContext({ session });
    },
  });
}
export { handler as GET, handler as POST };
