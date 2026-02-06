import {
  adminClient,
  inferAdditionalFields,
  lastLoginMethodClient,
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import type { auth } from "@dunzio/auth";
import { ac, admin, user } from "@dunzio/auth/permissions";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    twoFactorClient({
      onTwoFactorRedirect: () => {
        window.location.href = "/2fa";
      },
    }),
    adminClient({
      ac,
      roles: {
        admin,
        user,
      },
    }),
    organizationClient(),
    lastLoginMethodClient(),
  ],
});
