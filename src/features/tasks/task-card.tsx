"use client";

import { useDraggable } from "@dnd-kit/core";
import type { TaskSelect } from "./task-types";
import type { DragItemData } from "../projects/project-types";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EyeIcon, MoreHorizontal, Trash2Icon } from "lucide-react";

interface Props {
  task: TaskSelect;
}

export default function TaskCard({ task }: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `task-${task.id}`,
    data: { type: "task" } satisfies DragItemData,
  });

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    zIndex: transform ? 50 : undefined,
    position: transform ? "absolute" : undefined,
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "relative cursor-grab rounded-md border bg-white p-5 shadow-sm hover:shadow-md",
        transform &&
          "ring-primary w-full rounded-md border bg-white p-4 shadow-sm ring-1",
      )}
      style={style}
    >
      <DropdownMenu>
        <DropdownMenuTrigger className="absolute top-1 right-1">
          <Button size={"sm"} variant="ghost">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <EyeIcon /> View task
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem variant="destructive">
              <Trash2Icon /> Delete task
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <div>
        <h3>
          <Button variant={"link"} className="hover:cursor-pointer">
            {task.title}
          </Button>
        </h3>
      </div>
    </div>
  );
}
