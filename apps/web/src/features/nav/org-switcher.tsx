"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { OrgSwitcherSkeleton } from "@/features/loaders";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc";

export function OrgSwitcher() {
  const router = useRouter();
  const trpc = useTRPC();
  const { state: sidebarState } = useSidebar();
  const isCollapsed = sidebarState === "collapsed";

  const { data, isLoading, refetch } = useQuery(trpc.organization.list.queryOptions());

  const organizations = data?.organizations ?? [];
  const activeOrg = organizations.find((org) => org.isActive);

  const handleSwitchOrg = async (orgId: string) => {
    if (orgId === activeOrg?.id) return;

    try {
      const result = await authClient.organization.setActive({
        organizationId: orgId,
      });

      if (result.error) {
        throw new Error(result.error.message ?? "Failed to switch workspace");
      }

      await refetch();
      toast.success("Switched workspace");
      // Navigate to projects page for the new org
      router.push("/projects");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to switch workspace");
    }
  };

  const handleCreateOrg = () => {
    // Navigate to onboarding which handles org creation
    router.push("/onboarding");
  };

  if (isLoading) {
    return <OrgSwitcherSkeleton isCollapsed={isCollapsed} />;
  }

  if (organizations.length === 0) {
    return (
      <Button
        variant="ghost"
        className={cn("w-full justify-start gap-2", isCollapsed && "justify-center px-2")}
        onClick={handleCreateOrg}
      >
        <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-md">
          <Plus className="h-4 w-4" />
        </div>
        {!isCollapsed && <span className="text-sm">Create workspace</span>}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn("w-full justify-start gap-2 py-6", isCollapsed && "justify-center px-0")}
        >
          <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-md font-semibold">
            {activeOrg?.logo ?
              <img
                src={activeOrg.logo}
                alt={activeOrg.name}
                className="h-full w-full rounded-md object-cover"
              />
            : <span className="text-sm">{activeOrg?.name?.charAt(0).toUpperCase() ?? "?"}</span>}
          </div>
          {!isCollapsed && (
            <>
              <div className="flex flex-1 flex-col items-start text-left">
                <span className="truncate text-sm font-medium">
                  {activeOrg?.name ?? "Select workspace"}
                </span>
                {activeOrg?.role && (
                  <span className="text-muted-foreground text-xs capitalize">{activeOrg.role}</span>
                )}
              </div>
              <ChevronsUpDown className="text-muted-foreground h-4 w-4 shrink-0" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[240px]"
        sideOffset={8}
      >
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => handleSwitchOrg(org.id)}
            className="flex cursor-pointer items-center gap-2"
          >
            <div className="bg-primary/10 text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold">
              {org.logo ?
                <img
                  src={org.logo}
                  alt={org.name}
                  className="h-full w-full rounded-md object-cover"
                />
              : org.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-1 flex-col">
              <span className="truncate">{org.name}</span>
              <span className="text-muted-foreground text-xs capitalize">{org.role}</span>
            </div>
            {org.isActive && <Check className="text-primary h-4 w-4" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleCreateOrg}
          className="flex cursor-pointer items-center gap-2"
        >
          <div className="bg-muted flex h-6 w-6 items-center justify-center rounded-md">
            <Plus className="h-3 w-3" />
          </div>
          <span>Create workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
