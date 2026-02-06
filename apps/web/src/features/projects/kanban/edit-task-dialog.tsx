"use client";

import { useQuery } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditTaskFormSkeleton } from "@/features/loaders";
import { useTRPC } from "@/trpc";
import { EditTaskForm } from "./edit-task-form";
import { useKanbanSearchParams } from "./search-params";

type BoardColumn = {
  id: string;
  name: string;
};

type UserOption = {
  id: string;
  name: string | null;
  image: string | null;
};

type EditTaskDialogProps = {
  columns: BoardColumn[];
  users: UserOption[];
};

export function EditTaskDialog({ columns, users }: EditTaskDialogProps) {
  const trpc = useTRPC();
  const { searchParams, closeIssue } = useKanbanSearchParams();
  const selectedIssueId = searchParams.selectedIssue;

  const isOpen = selectedIssueId !== null;

  const { data: task, isLoading } = useQuery({
    ...trpc.task.getById.queryOptions({ id: selectedIssueId ?? "" }),
    enabled: isOpen && selectedIssueId !== null,
  });

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      void closeIssue();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle>{task ? `Edit ${task.key}` : "Edit Task"}</DialogTitle>
          <DialogDescription>
            Make changes to this task. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading ?
            <EditTaskFormSkeleton />
          : task ?
            <EditTaskForm
              task={task}
              columns={columns}
              users={users}
              onSuccess={() => void closeIssue()}
            />
          : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
