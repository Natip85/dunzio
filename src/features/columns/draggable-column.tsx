"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Columns from "./columns";
import type { ColumnSelect } from "./column-types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Edit2Icon, MoreHorizontal, PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import EditColumnForm from "./edit-column-form";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CreateTaskForm from "../tasks/create-task-form";
import { Separator } from "@/components/ui/separator";
import type { Project } from "../projects/project-types";

interface Props {
  column: ColumnSelect;
  tasks: Project["cols"][number]["colTasks"];
}

export default function DraggableColumn({ column, tasks }: Props) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { mutateAsync: deleteColumn, isPending: isLoading } =
    api.column.delete.useMutation();

  const { mutateAsync: deleteAllTasks, isPending: isDeleteLoading } =
    api.task.deleteByColumnId.useMutation();

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: `column-${column.id}`,
      data: { type: "column" },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className="bg-secondary relative flex min-h-96 flex-col gap-10 rounded-md border p-2"
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
    >
      <ResponsiveDialog
        isOpen={isEditOpen}
        isEditOpen={setIsEditOpen}
        title={`Edit column ${column.name}`}
      >
        <EditColumnForm column={column} setOpen={setIsEditOpen} />
      </ResponsiveDialog>

      <ResponsiveDialog
        isOpen={isDeleteOpen}
        isEditOpen={setIsDeleteOpen}
        title={`Delete column ${column.name}?`}
        description="This will permanently delete this option. This cannot be undone."
      >
        <div className="flex items-center justify-end gap-3">
          <Button
            onClick={async () => {
              setIsDeleteOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={isLoading}
            variant={"destructive"}
            onClick={async () => {
              await deleteColumn(column.id);
              setIsDeleteOpen(false);
              router.refresh();
            }}
          >
            Delete
          </Button>
        </div>
      </ResponsiveDialog>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild className="absolute top-0 right-0">
          <Button size={"sm"} variant="ghost">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Tasks</DropdownMenuLabel>
          <DropdownMenuGroup
            className={
              tasks.length === 0 ? "pointer-events-none opacity-50" : ""
            }
          >
            <DropdownMenuItem
              disabled={isDeleteLoading}
              variant="destructive"
              onMouseDown={async () => {
                await deleteAllTasks(column.id);
                router.refresh();
              }}
            >
              <Trash2Icon /> Delete all tasks
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Column</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onMouseDown={() => {
                setIsEditOpen(true);
              }}
            >
              <Edit2Icon /> Edit details
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onMouseDown={() => {
                setIsDeleteOpen(true);
              }}
            >
              <Trash2Icon /> Delete column
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Columns column={column} tasks={tasks} />

      <Dialog>
        <DialogTrigger
          asChild
          className="mt-auto flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-gray-300"
        >
          <Button type="button" variant="outline">
            <PlusIcon /> <span>Add task</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader className="w-full">
            <DialogTitle className="text-start">
              Add a new task to column {column.name}
            </DialogTitle>
            <Separator />
          </DialogHeader>
          <div className="w-full">
            <CreateTaskForm projectId={column.projectId} columnId={column.id} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
