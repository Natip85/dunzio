import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";

import { auth } from "@dunzio/auth";
import { db } from "@dunzio/db";
import { member } from "@dunzio/db/schema/auth";

import { getSession } from "@/lib/auth-server";

/**
 * Projects layout handles auth and organization validation.
 * Ensures user is authenticated and has a valid active organization.
 */
export default async function ProjectsLayout({ children }: { children: React.ReactNode }) {
  const reqHeaders = await headers();
  const session = await getSession();

  if (!session) {
    redirect("/auth/sign-in");
  }

  const activeOrgId = session.session.activeOrganizationId;

  // Case 1: User has an active org - verify membership
  if (activeOrgId) {
    const membership = await db.query.member.findFirst({
      where: and(eq(member.userId, session.user.id), eq(member.organizationId, activeOrgId)),
    });

    if (membership) {
      // Valid membership - proceed to render children
      return <>{children}</>;
    }

    // Invalid activeOrgId - need to select a new org
    // Check how many orgs the user has
    const allMemberships = await db.select().from(member).where(eq(member.userId, session.user.id));

    if (allMemberships.length === 0) {
      // No organizations at all
      redirect("/onboarding");
    }

    if (allMemberships.length === 1) {
      // Only one org - auto-select it
      await auth.api.setActiveOrganization({
        body: { organizationId: allMemberships[0].organizationId },
        headers: reqHeaders,
      });
      redirect("/projects");
    }

    // Multiple orgs - let user choose
    redirect("/select-workspace");
  }

  // Case 2: No active org - check how many memberships user has
  const allMemberships = await db.select().from(member).where(eq(member.userId, session.user.id));

  if (allMemberships.length === 0) {
    // User has no organizations - send to onboarding
    redirect("/onboarding");
  }

  if (allMemberships.length === 1) {
    // Only one organization - auto-select and redirect
    await auth.api.setActiveOrganization({
      body: { organizationId: allMemberships[0].organizationId },
      headers: reqHeaders,
    });
    redirect("/projects");
  }

  // Multiple organizations - let user choose which workspace to use
  redirect("/select-workspace");
}
