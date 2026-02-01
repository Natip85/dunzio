import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { lastLoginMethod } from "better-auth/plugins";
import { admin as adminPlugin } from "better-auth/plugins/admin";
import { twoFactor } from "better-auth/plugins/two-factor";

import { db } from "@quick-jot/db";
import * as schema from "@quick-jot/db/schema/auth";
import { env } from "@quick-jot/env/server";

import { sendDeleteAccountVerificationEmail } from "./emails/delete-account-verification";
import { sendEmailVerificationEmail } from "./emails/email-verification";
import { sendPasswordResetEmail } from "./emails/password-reset-email";

export const auth = betterAuth({
  appName: "My Better T App",
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, url, newEmail }) => {
        await sendEmailVerificationEmail({
          user: { ...user, email: newEmail },
          url,
        });
      },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        await sendDeleteAccountVerificationEmail({ user, url });
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({ user, url });
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmailVerificationEmail({ user, url });
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 1, // 1 minutes
    },
  },
  plugins: [nextCookies(), twoFactor(), adminPlugin(), lastLoginMethod()],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  trustedOrigins: env.BETTER_AUTH_URL ? [env.BETTER_AUTH_URL] : [],
});
