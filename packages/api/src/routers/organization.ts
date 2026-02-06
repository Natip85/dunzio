import { eq } from "drizzle-orm";

import { member as memberTable, organization as orgTable } from "@dunzio/db/schema/auth";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const organizationRouter = createTRPCRouter({
  /**
   * List all organizations the current user is a member of.
   * Returns org details along with the user's role in each org.
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const { session, db } = ctx;
    const userId = session.user.id;
    const activeOrgId = session.session.activeOrganizationId;

    // Get all memberships for the user
    const memberships = await db
      .select({
        organizationId: memberTable.organizationId,
        role: memberTable.role,
        createdAt: memberTable.createdAt,
      })
      .from(memberTable)
      .where(eq(memberTable.userId, userId));

    if (memberships.length === 0) {
      return {
        organizations: [],
        activeOrganizationId: null,
      };
    }

    // Query each org individually and join with membership data
    const orgsWithMembership = await Promise.all(
      memberships.map(async (membership) => {
        const [org] = await db
          .select()
          .from(orgTable)
          .where(eq(orgTable.id, membership.organizationId));

        if (!org) return null;

        return {
          id: org.id,
          name: org.name,
          slug: org.slug,
          logo: org.logo,
          createdAt: org.createdAt,
          role: membership.role,
          isActive: org.id === activeOrgId,
        };
      })
    );

    const validOrgs = orgsWithMembership.filter(
      (org): org is NonNullable<typeof org> => org !== null
    );

    return {
      organizations: validOrgs,
      activeOrganizationId: activeOrgId,
    };
  }),

  /**
   * Get count of organizations the user belongs to.
   * Useful for determining if org selection UI should be shown.
   */
  count: protectedProcedure.query(async ({ ctx }) => {
    const { session, db } = ctx;
    const userId = session.user.id;

    const memberships = await db
      .select({ organizationId: memberTable.organizationId })
      .from(memberTable)
      .where(eq(memberTable.userId, userId));

    return {
      count: memberships.length,
      hasMultiple: memberships.length > 1,
    };
  }),

  /**
   * Get the active organization details.
   */
  getActive: protectedProcedure.query(async ({ ctx }) => {
    const { session, db } = ctx;
    const activeOrgId = session.session.activeOrganizationId;

    if (!activeOrgId) {
      return null;
    }

    const [org] = await db.select().from(orgTable).where(eq(orgTable.id, activeOrgId));

    if (!org) {
      return null;
    }

    // Get user's role in this org
    const membership = await db.query.member.findFirst({
      where: (m, { and: whereAnd, eq: whereEq }) =>
        whereAnd(whereEq(m.organizationId, activeOrgId), whereEq(m.userId, session.user.id)),
    });

    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      logo: org.logo,
      role: membership?.role ?? "member",
    };
  }),
});
