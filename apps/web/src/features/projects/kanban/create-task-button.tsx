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

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
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
        />
      </DialogContent>
    </Dialog>
  );
}
