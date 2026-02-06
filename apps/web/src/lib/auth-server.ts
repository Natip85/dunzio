import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@dunzio/auth";

export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

export const requireSession = cache(async () => {
  const session = await getSession();
  if (!session) {
    redirect("/auth/sign-in");
  }
  return session;
});

export const requireActiveOrganizationId = cache(async () => {
  const session = await requireSession();
  const activeOrgId = session.session.activeOrganizationId;
  if (!activeOrgId) {
    redirect("/onboarding");
  }
  return activeOrgId;
});
