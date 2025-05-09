"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Columns from "./columns";
import type { ColumnSelect } from "./column-types";
import type { TaskSelect } from "../tasks/task-types";
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
import { Edit2Icon, MoreHorizontal, Trash2Icon } from "lucide-react";
import { useState } from "react";
interface Props {
  column: ColumnSelect;
  tasks: TaskSelect[];
}

export default function DraggableColumn({ column, tasks }: Props) {
  const [isEditOpen, setIsEditOpen] = useState(false);

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
      className="bg-secondary relative min-h-96 rounded-md border p-2"
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
    >
      <ResponsiveDialog
        isOpen={isEditOpen}
        isEditOpen={setIsEditOpen}
        title="Edit profile"
        description={`Any mediately.`}
      >
        form here
      </ResponsiveDialog>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild className="absolute top-0 right-0">
          <Button size={"sm"} variant="ghost">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Tasks</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Trash2Icon /> Delete all tasks
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Column</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onMouseDown={(event) => {
                event.stopPropagation();
                console.log("yessss");
                setIsEditOpen(true);
              }}
            >
              <Edit2Icon /> Edit details
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive">
              <Trash2Icon /> Delete column
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Columns column={column} tasks={tasks} />
    </div>
  );
}
