"use client";

import { useCallback, useState } from "react";
import { Plus } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddTaskForm } from "./add-task-form";

type BoardColumn = {
  id: string;
  name: string;
};

type UserOption = {
  id: string;
  name: string | null;
  image: string | null;
};

type CreateTaskButtonProps = {
  projectId: string;
  boardId: string;
  columns: BoardColumn[];
  users: UserOption[];
  defaultColumnId?: string;
};

export function CreateTaskButton({
  projectId,
  columns,
  users,
  defaultColumnId,
}: CreateTaskButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardAlert, setShowDiscardAlert] = useState(false);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open && isDirty) {
        setShowDiscardAlert(true);
        return;
      }
      setIsOpen(open);
    },
    [isDirty]
  );

  const handleDiscard = useCallback(() => {
    setShowDiscardAlert(false);
    setIsDirty(false);
    setIsOpen(false);
  }, []);

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={handleOpenChange}
      >
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-1 h-4 w-4" />
            Add Task
          </Button>
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-md"
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
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Add a new task to your project board.</DialogDescription>
          </DialogHeader>
          <AddTaskForm
            projectId={projectId}
            columns={columns}
            users={users}
            defaultColumnId={defaultColumnId}
            onSuccess={() => setIsOpen(false)}
            onDirtyChange={setIsDirty}
          />
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
