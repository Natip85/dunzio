"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvitesTab } from "./invites-tab";
import { MembersTab } from "./members-tab";

type Member = {
  id: string;
  userId: string;
  role: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
};

type Invitation = {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: Date;
};

type Organization = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  members: Member[];
  invitations: Invitation[];
};

type OrganizationTabsProps = {
  organization: Organization;
  organizationId: string;
};

export function OrganizationTabs({ organization, organizationId }: OrganizationTabsProps) {
  const router = useRouter();

  const handleUpdate = useCallback(() => {
    router.refresh();
  }, [router]);

  const pendingInvitations = organization.invitations?.filter((i) => i.status === "pending") ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-5" />
            {organization.name}
          </CardTitle>
          <CardDescription>/{organization.slug}</CardDescription>
        </CardHeader>
      </Card>

      <Tabs
        defaultValue="members"
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="members">Members ({organization.members?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="invitations">Invitations ({pendingInvitations.length})</TabsTrigger>
        </TabsList>
        <Card>
          <CardContent>
            <TabsContent value="members">
              <MembersTab
                members={organization.members ?? []}
                organizationId={organizationId}
                onUpdate={handleUpdate}
              />
            </TabsContent>

            <TabsContent value="invitations">
              <InvitesTab
                invitations={organization.invitations ?? []}
                organizationId={organizationId}
                onUpdate={handleUpdate}
              />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
