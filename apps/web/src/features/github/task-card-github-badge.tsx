"use client";

import { useQuery } from "@tanstack/react-query";
import { GitPullRequest } from "lucide-react";

import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc";

type TaskCardGitHubBadgeProps = {
  issueId: string;
};

/**
 * Small badge that shows the number of linked PRs and their merge status
 * on a kanban task card. Renders nothing if no PRs are linked.
 */
export function TaskCardGitHubBadge({ issueId }: TaskCardGitHubBadgeProps) {
  const trpc = useTRPC();
  const { data: links } = useQuery(
    trpc.github.getTaskLinks.queryOptions({ issueId }, { staleTime: 60_000 }) // Cache for 1 minute to avoid over-fetching on the board
  );

  if (!links) return null;

  const prs = links.filter((l) => l.type === "pr");
  if (prs.length === 0) return null;

  const allMerged = prs.every((pr) => pr.state === "merged");
  const hasOpen = prs.some((pr) => pr.state === "open");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs",
        allMerged ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
        : hasOpen ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
        : "bg-muted text-muted-foreground"
      )}
      title={`${prs.length} PR${prs.length > 1 ? "s" : ""}`}
    >
      <GitPullRequest className="size-3" />
      {prs.length}
    </span>
  );
}
