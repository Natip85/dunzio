import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@dunzio/auth";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InviteInformation } from "@/features/organization/invite-information";

type PageProps = {
  params: Promise<{ id: string }>;
};
export default async function InvitationPage({ params }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session == null) return redirect("/auth/sign-in");

  const { id } = await params;

  const invitation = await auth.api
    .getInvitation({
      headers: await headers(),
      query: { id: id },
    })
    .catch(() => redirect("/"));

  return (
    <div className="container mx-auto my-6 max-w-2xl px-4">
      <Card>
        <CardHeader>
          <CardTitle>Organization Invitation</CardTitle>
          <CardDescription>
            You have been invited to join the {invitation.organizationName} organization as a{" "}
            {invitation.role}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteInformation invitation={invitation} />
        </CardContent>
      </Card>
    </div>
  );
}
