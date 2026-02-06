"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddColumnForm } from "./add-column-form";

type EditColumnDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  column: {
    id: string;
    boardId: string;
    name: string;
    description?: string | null;
    color: string;
    category: string;
  };
};

export function EditColumnDialog({ open, onOpenChange, column }: EditColumnDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Column</DialogTitle>
          <DialogDescription>Update the column settings.</DialogDescription>
        </DialogHeader>
        <AddColumnForm
          boardId={column.boardId}
          columnId={column.id}
          initialValues={{
            name: column.name,
            description: column.description,
            color: column.color,
            category: column.category,
          }}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
