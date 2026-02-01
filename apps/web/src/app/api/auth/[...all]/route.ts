import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@quick-jot/auth";

export const { GET, POST } = toNextJsHandler(auth.handler);
