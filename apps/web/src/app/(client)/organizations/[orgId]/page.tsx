import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { auth } from "@dunzio/auth";

import { OrganizationTabs } from "@/features/organization/organization-tabs";

type OrganizationIdPageProps = {
  params: Promise<{ orgId: string }>;
};

export default async function OrganizationIdPage({ params }: OrganizationIdPageProps) {
  const { orgId } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return redirect("/auth/sign-in");

  const organization = await auth.api.getFullOrganization({
    headers: await headers(),
    query: { organizationId: orgId },
  });

  if (!organization) return notFound();

  return (
    <div className="my-6 space-y-4 px-4">
      <OrganizationTabs
        organization={organization}
        organizationId={orgId}
      />
    </div>
  );
}
