"use client";

import { useDroppable } from "@dnd-kit/core";
import type { ColumnSelect } from "./column-types";
import type { TaskSelect } from "../tasks/task-types";
import TaskCard from "../tasks/task-card";

interface Props {
  column: ColumnSelect;
  tasks: TaskSelect[];
}

export default function Columns({ column, tasks }: Props) {
  const { setNodeRef } = useDroppable({
    id: `column-${column.id}`,
  });

  return (
    <div className="w-80">
      <div className="flex items-center gap-2">
        <h2 className="font-semibold">{column.name}</h2>
        <span className="flex size-5 items-center justify-center rounded-full bg-gray-300 text-sm">
          {tasks.length}
        </span>
      </div>
      <h3 className="text-muted-foreground mb-4 text-sm">
        {column.description}
      </h3>
      <div ref={setNodeRef} className="flex flex-1 flex-col gap-4">
        {tasks.map((task) => {
          return <TaskCard key={task.id} task={task} />;
        })}
      </div>
    </div>
  );
}
