import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@dunzio/auth";
import { env } from "@dunzio/env/server";

/**
 * GET /api/github/connect
 *
 * Initiates the GitHub OAuth flow with repo-level scopes.
 * This is SEPARATE from the Better Auth sign-in flow — it requests
 * `repo` and `admin:repo_hook` so the app can read PRs and create webhooks.
 */
export async function GET(req: Request) {
  // 1. Verify the user is authenticated
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Generate a random state param for CSRF protection
  const state = crypto.randomUUID();

  const cookieStore = await cookies();
  cookieStore.set("github_oauth_state", state, {
    httpOnly: true,
    secure: false, // false for localhost dev
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });

  // Also store the user ID so the callback can use it even without session
  // (in case GitHub redirects to a different domain like ngrok)
  cookieStore.set("github_oauth_user_id", session.user.id, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });

  // 3. Redirect to GitHub authorization.
  // The callback URL points to localhost (same origin as the user's browser)
  // so the session cookies and state cookie will be available.
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    scope: "repo admin:repo_hook",
    state,
    redirect_uri: `${env.BETTER_AUTH_URL}/api/github/callback`,
  });

  return NextResponse.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
}
