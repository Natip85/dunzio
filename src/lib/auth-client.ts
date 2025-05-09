import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";
export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: process.env.BASE_URL,
  plugins: [magicLinkClient()],
});
