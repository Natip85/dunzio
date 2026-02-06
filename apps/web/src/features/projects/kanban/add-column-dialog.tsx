"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddColumnForm } from "./add-column-form";

type AddColumnDialogProps = {
  boardId: string;
};

export function AddColumnDialog({ boardId }: AddColumnDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0"
        >
          <Plus className="h-5 w-5" />
          <span className="sr-only">Add column</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Column</DialogTitle>
          <DialogDescription>
            Create a new column for your board. Choose a name, category, and color.
          </DialogDescription>
        </DialogHeader>
        <AddColumnForm
          boardId={boardId}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
