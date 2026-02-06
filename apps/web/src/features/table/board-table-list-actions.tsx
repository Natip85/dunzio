"use client";

import type { Row } from "@tanstack/react-table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreVertical } from "lucide-react";
import { toast } from "sonner";

import type { BoardIssue } from "./board-columns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTRPC } from "@/trpc";

type BoardActionsProps = {
  row: Row<BoardIssue>;
};

export function BoardTableListActions({ row }: BoardActionsProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { mutate: deleteTask } = useMutation(
    trpc.task.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Task deleted successfully");
        void queryClient.invalidateQueries({
          queryKey: [["task", "getByColumn"]],
        });
      },
    })
  );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="data-[state=open]:bg-muted mx-auto"
        >
          <MoreVertical className="size-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[160px]"
      >
        <DropdownMenuItem onClick={() => deleteTask({ id: row.original.id })}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
