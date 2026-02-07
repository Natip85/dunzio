"use client";

import { useQuery } from "@tanstack/react-query";
import { ExternalLink, GitBranch, GitCommit, GitPullRequest, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc";

type TaskGitHubLinksProps = {
  issueId: string;
};

const PR_STATE_STYLES: Record<string, string> = {
  open: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  closed: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  merged: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
};

export function TaskGitHubLinks({ issueId }: TaskGitHubLinksProps) {
  const trpc = useTRPC();
  const { data: links, isLoading } = useQuery(trpc.github.getTaskLinks.queryOptions({ issueId }));

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <Loader2 className="size-3.5 animate-spin" />
        <span className="text-muted-foreground text-xs">Loading GitHub links...</span>
      </div>
    );
  }

  if (!links || links.length === 0) {
    return null;
  }

  const branches = links.filter((l) => l.type === "branch");
  const prs = links.filter((l) => l.type === "pr");
  const commits = links.filter((l) => l.type === "commit");

  return (
    <div className="flex flex-col gap-3">
      <Separator />
      <h4 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">GitHub</h4>

      {/* Branches */}
      {branches.length > 0 && (
        <LinkSection
          icon={<GitBranch className="size-3.5" />}
          title="Branches"
        >
          {branches.map((link) => (
            <LinkItem
              key={link.id}
              href={link.url}
              label={link.ref}
            />
          ))}
        </LinkSection>
      )}

      {/* Pull Requests */}
      {prs.length > 0 && (
        <LinkSection
          icon={<GitPullRequest className="size-3.5" />}
          title="Pull Requests"
        >
          {prs.map((link) => (
            <LinkItem
              key={link.id}
              href={link.url}
              label={link.title ?? `#${link.ref}`}
              badge={
                link.state ?
                  <Badge
                    variant="secondary"
                    className={cn("text-[10px]", PR_STATE_STYLES[link.state])}
                  >
                    {link.state}
                  </Badge>
                : null
              }
            />
          ))}
        </LinkSection>
      )}

      {/* Commits */}
      {commits.length > 0 && (
        <LinkSection
          icon={<GitCommit className="size-3.5" />}
          title="Commits"
        >
          {commits.map((link) => (
            <LinkItem
              key={link.id}
              href={link.url}
              label={link.title ?? link.ref.slice(0, 7)}
              sublabel={link.ref.slice(0, 7)}
            />
          ))}
        </LinkSection>
      )}
    </div>
  );
}

function LinkSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-muted-foreground flex items-center gap-1.5">
        {icon}
        <span className="text-xs font-medium">{title}</span>
      </div>
      <div className="flex flex-col gap-1 pl-5">{children}</div>
    </div>
  );
}

function LinkItem({
  href,
  label,
  sublabel,
  badge,
}: {
  href: string;
  label: string;
  sublabel?: string;
  badge?: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group hover:bg-muted flex items-center gap-2 rounded px-1.5 py-1 text-xs transition-colors"
    >
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {sublabel && <code className="text-muted-foreground font-mono text-[10px]">{sublabel}</code>}
      {badge}
      <ExternalLink className="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
    </a>
  );
}
