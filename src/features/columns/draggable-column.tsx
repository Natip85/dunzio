"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Columns from "./columns";
import type { ColumnSelect } from "./column-types";
import type { TaskSelect } from "../tasks/task-types";

interface Props {
  column: ColumnSelect;
  tasks: TaskSelect[];
}

export default function DraggableColumn({ column, tasks }: Props) {
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
      className="bg-secondary min-h-96 rounded-md border p-2"
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
    >
      <Columns column={column} tasks={tasks} />
    </div>
  );
}
