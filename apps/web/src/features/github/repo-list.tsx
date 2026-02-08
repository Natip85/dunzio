"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GithubIcon, Globe, Loader2, Lock, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc";

export function ConnectedRepoList() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: repos, isLoading } = useQuery(trpc.github.listConnectedRepos.queryOptions());

  const disconnectMutation = useMutation(
    trpc.github.disconnectRepo.mutationOptions({
      onSuccess: () => {
        toast.success("Repository disconnected");
        void queryClient.invalidateQueries({ queryKey: [["github"]] });
      },
      onError: () => {
        toast.error("Failed to disconnect repository");
      },
    })
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4">
        <Loader2 className="size-4 animate-spin" />
        <span className="text-muted-foreground text-sm">Loading connected repos...</span>
      </div>
    );
  }

  if (!repos || repos.length === 0) {
    return (
      <div className="text-muted-foreground py-4 text-center text-sm">
        No repositories connected yet. Connect your GitHub account and add a repository.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {repos.map((repo) => (
        <div
          key={repo.id}
          className="flex items-center justify-between rounded-md border px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <GithubIcon className="text-muted-foreground size-4" />
            <a
              href={`https://github.com/${repo.fullName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium underline-offset-2 hover:underline"
            >
              {repo.fullName}
            </a>
            {repo.isPrivate ?
              <Badge variant="outline">
                <Lock className="size-3" />
                Private
              </Badge>
            : <Badge variant="outline">
                <Globe className="size-3" />
                Public
              </Badge>
            }
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => disconnectMutation.mutate({ repoId: repo.id })}
            disabled={disconnectMutation.isPending}
          >
            {disconnectMutation.isPending ?
              <Loader2 className="size-3.5 animate-spin" />
            : <Trash2 className="size-3.5" />}
          </Button>
        </div>
      ))}
    </div>
  );
}

export function RepoSelector() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: connection } = useQuery(trpc.github.getConnection.queryOptions());
  const { data: repos, isLoading } = useQuery({
    ...trpc.github.listRepos.queryOptions(),
    enabled: connection?.connected === true,
  });
  const { data: connectedRepos } = useQuery(trpc.github.listConnectedRepos.queryOptions());

  const connectMutation = useMutation(
    trpc.github.connectRepo.mutationOptions({
      onSuccess: () => {
        toast.success("Repository connected! Webhooks are now active.");
        void queryClient.invalidateQueries({ queryKey: [["github"]] });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to connect repository");
      },
    })
  );

  if (!connection?.connected) {
    return (
      <p className="text-muted-foreground text-sm">
        Connect your GitHub account first to see available repositories.
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4">
        <Loader2 className="size-4 animate-spin" />
        <span className="text-muted-foreground text-sm">Fetching repositories from GitHub...</span>
      </div>
    );
  }

  if (!repos || repos.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No repositories found. Make sure you have access to repositories on GitHub.
      </p>
    );
  }

  // Filter out already-connected repos
  const connectedRepoIds = new Set(connectedRepos?.map((r) => r.githubRepoId) ?? []);
  const availableRepos = repos.filter((r) => !connectedRepoIds.has(r.id));

  if (availableRepos.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">All your repositories are already connected.</p>
    );
  }

  return (
    <Accordion
      type="single"
      collapsible
    >
      <AccordionItem value="github">
        <AccordionTrigger className="bg-primary/50 p-3">Add repository</AccordionTrigger>
        <AccordionContent>
          <div className="flex max-h-80 flex-col gap-1 overflow-y-auto">
            {availableRepos.map((repo) => (
              <div
                key={repo.id}
                className="hover:bg-muted/50 flex items-center justify-between rounded-md px-3 py-2 transition-colors"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <GithubIcon className="text-muted-foreground size-3.5 shrink-0" />
                  <span className="truncate text-sm">{repo.fullName}</span>
                  {repo.isPrivate && <Lock className="text-muted-foreground size-3 shrink-0" />}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    connectMutation.mutate({
                      githubRepoId: repo.id,
                      owner: repo.owner,
                      name: repo.name,
                      fullName: repo.fullName,
                      isPrivate: repo.isPrivate,
                    })
                  }
                  disabled={connectMutation.isPending}
                >
                  {connectMutation.isPending ?
                    <Loader2 className="size-3.5 animate-spin" />
                  : <Plus className="size-3.5" />}
                  Connect
                </Button>
              </div>
            ))}
          </div>{" "}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
