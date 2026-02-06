"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/trpc";

export default function SelectWorkspacePage() {
  const router = useRouter();
  const trpc = useTRPC();

  const { data, isLoading, refetch } = useQuery(trpc.organization.list.queryOptions());

  const organizations = data?.organizations ?? [];
  const activeOrg = organizations.find((org) => org.isActive);

  // If user has no organizations, redirect to onboarding
  useEffect(() => {
    if (!isLoading && organizations.length === 0) {
      router.replace("/onboarding");
    }
  }, [isLoading, organizations.length, router]);

  // If user has only one organization, auto-select and redirect
  useEffect(() => {
    if (!isLoading && organizations.length === 1 && !activeOrg) {
      const singleOrg = organizations[0];
      if (singleOrg) {
        void handleSelectOrg(singleOrg.id);
      }
    }
  }, [isLoading, organizations, activeOrg]);

  const handleSelectOrg = async (orgId: string) => {
    try {
      const result = await authClient.organization.setActive({
        organizationId: orgId,
      });

      if (result.error) {
        throw new Error(result.error.message ?? "Failed to select workspace");
      }

      await refetch();
      // Navigate to projects page
      router.replace("/projects");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to select workspace");
    }
  };

  const handleContinueWithActive = () => {
    router.replace("/projects");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-6 py-12">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
            <p className="text-muted-foreground text-sm">Loading workspaces...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Only show selection if user has multiple orgs
  if (organizations.length <= 1) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-6 py-12">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
            <p className="text-muted-foreground text-sm">Redirecting...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Select a workspace</CardTitle>
          <CardDescription>
            You belong to multiple workspaces. Choose which one to work in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {organizations.map((org) => (
            <button
              key={org.id}
              onClick={() => handleSelectOrg(org.id)}
              className="hover:bg-accent group flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors"
            >
              <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-md font-semibold">
                {org.logo ?
                  <img
                    src={org.logo}
                    alt={org.name}
                    className="h-full w-full rounded-md object-cover"
                  />
                : <span>{org.name.charAt(0).toUpperCase()}</span>}
              </div>
              <div className="flex flex-1 flex-col">
                <span className="font-medium">{org.name}</span>
                <span className="text-muted-foreground text-sm capitalize">{org.role}</span>
              </div>
              {org.isActive ?
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">Current</span>
                  <Check className="text-primary h-5 w-5" />
                </div>
              : <ArrowRight className="text-muted-foreground h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100" />
              }
            </button>
          ))}

          {activeOrg && (
            <div className="pt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleContinueWithActive}
              >
                Continue with {activeOrg.name}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
