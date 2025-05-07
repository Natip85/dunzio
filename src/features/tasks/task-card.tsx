"use client";

import { useDraggable } from "@dnd-kit/core";
import type { TaskSelect } from "./task-types";
import type { DragItemData } from "../projects/project-types";

interface Props {
  task: TaskSelect;
}

export default function TaskCard({ task }: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `task-${task.id}`,
    data: { type: "task" } satisfies DragItemData,
  });

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="cursor-grab rounded-md border bg-white p-4 shadow-sm hover:shadow-md"
      style={style}
    >
      <h3>{task.title}</h3>
    </div>
  );
}
