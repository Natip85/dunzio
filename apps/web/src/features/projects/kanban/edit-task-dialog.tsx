"use client";

import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskGitHubLinks } from "@/features/github/task-github-links";
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
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardAlert, setShowDiscardAlert] = useState(false);

  const { data: task, isLoading } = useQuery({
    ...trpc.task.getById.queryOptions({ id: selectedIssueId ?? "" }),
    enabled: isOpen && selectedIssueId !== null,
  });

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open && isDirty) {
        setShowDiscardAlert(true);
        return;
      }
      if (!open) {
        void closeIssue();
      }
    },
    [isDirty, closeIssue]
  );

  const handleDiscard = useCallback(() => {
    setShowDiscardAlert(false);
    setIsDirty(false);
    void closeIssue();
  }, [closeIssue]);

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={handleOpenChange}
      >
        <DialogContent
          className="flex max-h-[85vh] flex-col sm:max-w-lg"
          onInteractOutside={(e) => {
            if (isDirty) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (isDirty) {
              e.preventDefault();
              setShowDiscardAlert(true);
            }
          }}
        >
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
              <>
                <EditTaskForm
                  task={task}
                  columns={columns}
                  users={users}
                  onSuccess={() => void closeIssue()}
                  onDirtyChange={setIsDirty}
                />
                <TaskGitHubLinks issueId={task.id} />
              </>
            : null}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={showDiscardAlert}
        onOpenChange={setShowDiscardAlert}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes that will be lost if you close this dialog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue editing</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDiscard}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
