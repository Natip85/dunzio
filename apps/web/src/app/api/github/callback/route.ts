import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@dunzio/auth";
import { db } from "@dunzio/db";
import { githubConnection } from "@dunzio/db/schema/projects";
import { env } from "@dunzio/env/server";

/**
 * GET /api/github/callback
 *
 * Handles the GitHub OAuth callback after the user authorizes repo-level access.
 * Exchanges the code for an access token and stores it in `github_connection`.
 *
 * GitHub redirects here with ?code=xxx&state=yyy. Since the connect route
 * uses BETTER_AUTH_URL (localhost) as the redirect_uri, this handler runs
 * on localhost where session cookies are available.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  // 1. Verify state to prevent CSRF
  const cookieStore = await cookies();
  const storedState = cookieStore.get("github_oauth_state")?.value;
  const storedUserId = cookieStore.get("github_oauth_user_id")?.value;
  cookieStore.delete("github_oauth_state");
  cookieStore.delete("github_oauth_user_id");

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(
      `${env.BETTER_AUTH_URL}/settings/integrations?error=invalid_state`
    );
  }

  // 2. Get user ID — prefer session, fall back to stored cookie
  const session = await auth.api.getSession({ headers: req.headers });
  const userId = session?.user.id ?? storedUserId;

  if (!userId) {
    return NextResponse.redirect(`${env.BETTER_AUTH_URL}/auth/sign-in`);
  }

  try {
    // 3. Exchange code for access token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = (await tokenRes.json()) as {
      access_token?: string;
      scope?: string;
      error?: string;
      error_description?: string;
    };

    if (!tokenData.access_token) {
      // eslint-disable-next-line no-console
      console.error("[GitHub OAuth] Token exchange failed:", tokenData);
      return NextResponse.redirect(
        `${env.BETTER_AUTH_URL}/settings/integrations?error=token_exchange_failed`
      );
    }

    // 4. Fetch GitHub user info
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/json",
      },
    });

    const githubUser = (await userRes.json()) as {
      id: number;
      login: string;
    };

    // 5. Upsert the github connection
    await db
      .insert(githubConnection)
      .values({
        userId,
        githubUserId: String(githubUser.id),
        githubUsername: githubUser.login,
        accessToken: tokenData.access_token,
        scope: tokenData.scope ?? null,
      })
      .onConflictDoUpdate({
        target: githubConnection.userId,
        set: {
          githubUserId: String(githubUser.id),
          githubUsername: githubUser.login,
          accessToken: tokenData.access_token,
          scope: tokenData.scope ?? null,
          updatedAt: new Date(),
        },
      });

    return NextResponse.redirect(`${env.BETTER_AUTH_URL}/settings/integrations?github=connected`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[GitHub OAuth] Callback error:", error);
    return NextResponse.redirect(
      `${env.BETTER_AUTH_URL}/settings/integrations?error=callback_failed`
    );
  }
}
