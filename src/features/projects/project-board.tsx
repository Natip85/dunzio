"use client";

import { useEffect, useState } from "react";
import type { TaskSelect } from "../tasks/task-types";
import type { DragItemData, Project } from "./project-types";
import { api } from "@/trpc/react";
import {
  DndContext,
  type DragEndEvent,
  closestCenter,
  useSensor,
  useSensors,
  MouseSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import DraggableColumn from "../columns/draggable-column";
import CreateColumnForm from "../columns/create-column-form";

interface Props {
  project: Project;
}

export default function ProjectBoard({ project }: Props) {
  const [tasks, setTasks] = useState<Project["cols"][number]["colTasks"]>([]);
  const [columns, setColumns] = useState(project.cols);
  const { mutateAsync: updateTaskColumn } =
    api.task.updateTaskColumn.useMutation();
  const { mutateAsync: updateColumnPositions } =
    api.column.updateColumnPositions.useMutation();
  useEffect(() => {
    setColumns(project.cols);
    setTasks(project.cols.flatMap((col) => col.colTasks));
  }, [project]);
  const sensors = useSensors(
    useSensor(MouseSensor, {
      onActivation: (event) => event.event.stopPropagation(),
      activationConstraint: { distance: 1 },
    }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!active || !over) return;

    const dragData = active.data.current as DragItemData | undefined;
    if (!dragData) return;

    const activeType = dragData.type;

    if (activeType === "column") {
      const oldIndex = columns.findIndex(
        (col) => `column-${col.id}` === active.id,
      );
      const newIndex = columns.findIndex(
        (col) => `column-${col.id}` === over.id,
      );

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

      const reordered = arrayMove(columns, oldIndex, newIndex);

      const reindexed = reordered.map((col, index) => ({
        id: col.id,
        position: index,
      }));

      setColumns(reordered);
      await updateColumnPositions(reindexed);
    }

    if (activeType === "task") {
      const taskId = +active.id.toString().replace("task-", "");
      const newColumnId = +over.id.toString().replace("column-", "");

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, columnId: newColumnId } : task,
        ),
      );

      await updateTaskColumn({ taskId, columnId: newColumnId });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={columns.map((col) => `column-${col.id}`)}
        strategy={horizontalListSortingStrategy}
      >
        <div className="flex gap-4 overflow-y-auto">
          {columns.map((column) => (
            <DraggableColumn
              key={column.id}
              column={column}
              tasks={tasks.filter((task) => task.columnId === column.id)}
            />
          ))}

          <CreateColumnForm projectId={project.id} />
        </div>
      </SortableContext>
    </DndContext>
  );
}
