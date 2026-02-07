"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GithubIcon, Loader2, Unplug } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc";

export function GitHubConnectButton() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(trpc.github.getConnection.queryOptions());

  const disconnectMutation = useMutation(
    trpc.github.disconnect.mutationOptions({
      onSuccess: () => {
        toast.success("GitHub account disconnected");
        void queryClient.invalidateQueries({ queryKey: [["github"]] });
      },
      onError: () => {
        toast.error("Failed to disconnect GitHub account");
      },
    })
  );

  if (isLoading) {
    return (
      <Button
        variant="outline"
        disabled
      >
        <Loader2 className="size-4 animate-spin" />
        Checking connection...
      </Button>
    );
  }

  if (data?.connected) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <GithubIcon className="size-4" />
          <span className="text-sm font-medium">{data.githubUsername}</span>
          <Badge variant="secondary">Connected</Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => disconnectMutation.mutate()}
          disabled={disconnectMutation.isPending}
        >
          {disconnectMutation.isPending ?
            <Loader2 className="size-3.5 animate-spin" />
          : <Unplug className="size-3.5" />}
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={() => {
        window.location.href = "/api/github/connect";
      }}
    >
      <GithubIcon className="size-4" />
      Connect GitHub
    </Button>
  );
}
