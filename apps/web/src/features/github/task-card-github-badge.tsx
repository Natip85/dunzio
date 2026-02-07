"use client";

import { useQuery } from "@tanstack/react-query";
import { ExternalLink, GitBranch, GitCommit, GitPullRequest } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc";

type TaskCardGitHubBadgeProps = {
  issueId: string;
};

const TYPE_ICON = {
  branch: GitBranch,
  pr: GitPullRequest,
  commit: GitCommit,
} as const;

const STATE_STYLES: Record<string, string> = {
  open: "text-green-400",
  closed: "text-red-400",
  merged: "text-purple-400",
};

/**
 * Compact icon on the kanban card. Hovering shows a tooltip with a clickable
 * link to the primary GitHub entity (branch > PR > commit) plus summary counts.
 */
export function TaskCardGitHubBadge({ issueId }: TaskCardGitHubBadgeProps) {
  const trpc = useTRPC();
  const { data: links } = useQuery(
    trpc.github.getTaskLinks.queryOptions({ issueId }, { staleTime: 60_000 })
  );

  if (!links || links.length === 0) return null;

  const branches = links.filter((l) => l.type === "branch");
  const prs = links.filter((l) => l.type === "pr");
  const commits = links.filter((l) => l.type === "commit");

  // Prioritise branch > PR > commit
  const first = branches[0] ?? prs[0] ?? commits[0] ?? links[0];
  const Icon = TYPE_ICON[first.type] ?? GitBranch;

  // Display label for the tooltip link
  const linkLabel =
    first.type === "pr" ? (first.title ?? `#${first.ref}`)
    : first.type === "commit" ? first.ref.slice(0, 7)
    : first.ref;

  // Summary lines
  const summaryParts: string[] = [];
  if (branches.length > 0) {
    summaryParts.push(`${branches.length} branch${branches.length > 1 ? "es" : ""}`);
  }
  if (prs.length > 0) {
    summaryParts.push(`${prs.length} PR${prs.length > 1 ? "s" : ""}`);
  }
  if (commits.length > 0) {
    summaryParts.push(`${commits.length} commit${commits.length > 1 ? "s" : ""}`);
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="text-muted-foreground inline-flex cursor-default items-center rounded p-0.5">
          <Icon className="size-3.5" />
        </span>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-[280px]"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <div className="flex flex-col gap-1.5">
          {/* Clickable link */}
          <a
            href={first.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="group flex items-center gap-1.5 text-sm font-medium underline-offset-2 hover:underline"
          >
            <Icon className="size-3.5 shrink-0" />
            <span className="min-w-0 truncate">{linkLabel}</span>
            {first.state && (
              <span className={cn("text-xs", STATE_STYLES[first.state])}>({first.state})</span>
            )}
            <ExternalLink className="size-3 shrink-0 opacity-60 group-hover:opacity-100" />
          </a>

          {/* Summary counts */}
          {summaryParts.length > 0 && (
            <span className="text-xs opacity-70">{summaryParts.join(" · ")}</span>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
