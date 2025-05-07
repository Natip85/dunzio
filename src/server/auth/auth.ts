import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/server/db";
import { schema } from "../db/schema/auth-schema";
import { env } from "@/env";
import { Resend } from "resend";
import { magicLink } from "better-auth/plugins";

const resend = new Resend(env.AUTH_RESEND_KEY);

export const auth = betterAuth({
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await resend.emails.send({
          from: `Support <${env.EMAIL_FROM}>`,
          to: email,
          subject: "Sign in",
          react: `click here to sign in ${url}`,
        });
      },
    }),
  ],
  socialProviders: {
    google: {
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    },
  },
  emailAndPassword: {
    enabled: true,
  },

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
});
