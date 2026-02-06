"use client";

import { FolderKanban, MoreVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContentLink,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ProjectCardProps = {
  project: {
    id: string;
    name: string;
    key: string;
    updatedAt: Date;
  };
  onEdit?: (projectId: string) => void;
  onDelete?: (projectId: string) => void;
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  return (
    <Card className="hover:bg-muted/50 group relative cursor-pointer rounded-md p-0 transition-colors">
      <CardContentLink
        className="pt-4 pb-4"
        href={`/projects/${project.id}`}
      >
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
              <FolderKanban className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="truncate">{project.name}</CardTitle>
              <CardDescription className="truncate">
                {project.key} · Updated {formatRelativeTime(project.updatedAt)}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-3 right-3 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => e.preventDefault()}
              >
                <MoreVertical className="size-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(project.id);
                }}
              >
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(project.id);
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
      </CardContentLink>
    </Card>
  );
}
