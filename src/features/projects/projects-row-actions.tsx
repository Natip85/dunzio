"use client";

import { type Row } from "@tanstack/react-table";
import { MoreHorizontal, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProjectSelect } from "./project-types";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

interface ProjectsRowActionsProps {
  row: Row<ProjectSelect>;
}

export function ProjectsRowActions({ row }: ProjectsRowActionsProps) {
  const router = useRouter();
  const { mutateAsync: deleteProject, isPending: isDeleteLoading } =
    api.project.delete.useMutation({
      onSuccess: () => {
        router.refresh();
      },
    });
  return (
    <div className="flex w-full justify-end pr-5">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
          >
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            disabled={isDeleteLoading}
            variant="destructive"
            onClick={async () => deleteProject(row.original.id)}
          >
            <Trash2Icon />
            Delete project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
