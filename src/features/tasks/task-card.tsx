"use client";

import { useDraggable } from "@dnd-kit/core";
import type { DragItemData, Project } from "../projects/project-types";
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
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import EditTaskTitleForm from "./edit-task-title-form";
import EditDescriptionForm from "./edit-description-form";
import AddComment from "../comments/add-comment";
import CommentThread from "../comments/comment-thread";
interface Props {
  task: Project["cols"][number]["colTasks"][number];
}

export default function TaskCard({ task }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `task-${task.id}`,
    data: { type: "task" } satisfies DragItemData,
  });

  const { mutateAsync: deleteTask, isPending: isLoading } =
    api.task.delete.useMutation();

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
        "cursor-grab rounded-md border bg-white p-5 shadow-sm hover:shadow-md",
        transform &&
          "ring-primary w-full rounded-md border bg-white p-4 shadow-sm ring-1",
      )}
      style={style}
    >
      <div className="flex">
        <h3>
          <Button
            onClick={() => setOpen(true)}
            variant={"link"}
            className="hover:cursor-pointer"
          >
            {task.title}
          </Button>
        </h3>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button size={"sm"} variant="ghost">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setOpen(true)}>
                <EyeIcon /> View task
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                variant="destructive"
                onClick={async () => {
                  await deleteTask(task.id);
                  router.refresh();
                }}
              >
                <Trash2Icon /> {isLoading ? "Deleting task" : "Delete task"}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="taskSide">
          <SheetHeader>
            <EditTaskTitleForm task={task} />
            <Separator />
          </SheetHeader>
          <div className="max-h-[100vh] overflow-y-auto p-5">
            <div>
              <EditDescriptionForm task={task} />
            </div>
            <div>
              <CommentThread task={task} />
            </div>
            <div>
              <AddComment task={task} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
