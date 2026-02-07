import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { auth } from "@dunzio/auth";

import { PageTitle } from "@/components/page-title";
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
    <div className="flex flex-1 flex-col gap-6 py-6 pr-4.5 pl-6">
      <PageTitle title={organization.name} />
      <OrganizationTabs
        organization={organization}
        organizationId={orgId}
      />
    </div>
  );
}
