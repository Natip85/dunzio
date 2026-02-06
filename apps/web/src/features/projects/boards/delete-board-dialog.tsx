"use client";

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

type DeleteBoardDialogProps = {
  board: {
    id: string;
    name: string;
    isDefault: boolean;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
};

export function DeleteBoardDialog({
  board,
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: DeleteBoardDialogProps) {
  if (board.isDefault) {
    return (
      <AlertDialog
        open={open}
        onOpenChange={onOpenChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cannot Delete Default Board</AlertDialogTitle>
            <AlertDialogDescription>
              The default board cannot be deleted. You must have at least one board in your project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Board</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{board.name}&quot;? This action cannot be undone.
            All columns in this board will be deleted, and tasks will be unassigned from their
            columns.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete Board"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
