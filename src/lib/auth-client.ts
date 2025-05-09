import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";
import { env } from "@/env";
export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: env.NEXT_PUBLIC_BASE_URL,
  plugins: [magicLinkClient()],
});
