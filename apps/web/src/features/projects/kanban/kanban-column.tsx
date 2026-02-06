"use client";

import type { CSSProperties } from "react";
import { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";

import type { KanbanFilter } from "./search-params";
import type { Task } from "./task-card";
import { TaskCardSkeleton } from "@/features/loaders";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc";
import { ColumnHeader } from "./column-header";
import { TaskCard } from "./task-card";

type BoardColumn = {
  id: string;
  boardId: string;
  name: string;
  description: string | null;
  color: string;
  position: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
};

type KanbanColumnProps = {
  column: BoardColumn;
  isOverlay?: boolean;
  tasks?: Task[];
  filter?: KanbanFilter;
  siblingColumns?: { id: string; name: string; color: string }[];
  onTaskClick?: (taskId: string) => void;
};

export function KanbanColumn({
  column,
  isOverlay,
  tasks: externalTasks,
  filter,
  siblingColumns = [],
  onTaskClick,
}: KanbanColumnProps) {
  if (isOverlay) {
    return (
      <KanbanColumnOverlay
        column={column}
        tasks={externalTasks}
        filter={filter}
        siblingColumns={siblingColumns}
      />
    );
  }

  return (
    <SortableKanbanColumn
      column={column}
      tasks={externalTasks}
      filter={filter}
      siblingColumns={siblingColumns}
      onTaskClick={onTaskClick}
    />
  );
}

function KanbanColumnOverlay({
  column,
  tasks: externalTasks,
  filter,
  siblingColumns = [],
}: Omit<KanbanColumnProps, "isOverlay" | "onTaskClick">) {
  const trpc = useTRPC();

  // Overlay is presentational only: DO NOT register droppables/sortables here.
  // Duplicate dnd-kit registrations (same id in normal tree + overlay) cause
  // measurement jitter and visible layout shifts during drag.
  const { data: fetchedTasks = [], isLoading: isLoadingTasks } = useQuery({
    ...trpc.task.getByColumn.queryOptions({ columnId: column.id, filter }),
    enabled: !externalTasks,
  });

  const tasks = externalTasks ?? fetchedTasks;

  return (
    <div
      className={cn(
        "bg-muted/30 flex w-60 shrink-0 flex-col self-start",
        "ring-primary pointer-events-none shadow-lg ring-2"
      )}
    >
      <div className="flex items-center p-3 pb-2">
        <div className="text-muted-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded">
          <GripVertical className="h-4 w-4" />
        </div>
        <ColumnHeader
          column={column}
          count={tasks.length}
          siblingColumns={siblingColumns}
        />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-3">
        {isLoadingTasks && !externalTasks ?
          <>
            <TaskCardSkeleton />
            <TaskCardSkeleton />
          </>
        : tasks.length === 0 ?
          <div className="text-muted-foreground flex min-h-26 items-center justify-center rounded-md border border-dashed text-sm">
            No issues
          </div>
        : tasks.slice(0, 6).map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isOverlay
            />
          ))
        }
      </div>
    </div>
  );
}

function SortableKanbanColumn({
  column,
  tasks: externalTasks,
  filter,
  siblingColumns = [],
  onTaskClick,
}: Omit<KanbanColumnProps, "isOverlay">) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  // If tasks are provided externally (for optimistic updates), use them
  // Otherwise fetch from the server with optional filter
  const { data: fetchedTasks = [], isLoading: isLoadingTasks } = useQuery({
    ...trpc.task.getByColumn.queryOptions({ columnId: column.id, filter }),
    enabled: !externalTasks,
  });

  const { mutate: deleteTask } = useMutation(
    trpc.task.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Task deleted successfully");
        void queryClient.invalidateQueries({
          queryKey: [["task", "getByColumn"]],
        });
      },
    })
  );
  const tasks = externalTasks ?? fetchedTasks;
  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
  });

  // Use droppable for the column content area to accept tasks
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `column-droppable-${column.id}`,
    data: {
      type: "column-droppable",
      columnId: column.id,
    },
  });

  // Same rationale as TaskCard: keep the real column stationary while dragging
  // so it can't inflate horizontal scroll width when moved past the container edge.
  const style: CSSProperties = {
    transform: isDragging ? undefined : CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("bg-muted/30 flex w-60 shrink-0 flex-col", isDragging && "opacity-50")}
    >
      {/* Column Header with drag handle — sticky so it stays visible when scrolling the board */}
      <div className="bg-muted sticky top-0 z-10 flex items-center gap-3 p-3 pb-2">
        <button
          {...attributes}
          {...listeners}
          className={cn(
            "text-muted-foreground flex h-6 w-6 shrink-0 cursor-grab items-center justify-center rounded",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
            isDragging && "cursor-grabbing"
          )}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <ColumnHeader
          column={column}
          count={tasks.length}
          siblingColumns={siblingColumns}
        />
      </div>

      {/* Column Content - where issues will be rendered */}
      <div
        ref={setDroppableRef}
        className={cn(
          "relative z-0 flex flex-1 flex-col gap-4 p-3",
          isOver && "bg-accent/50 rounded-b-lg"
        )}
      >
        {isLoadingTasks && !externalTasks ?
          <>
            <TaskCardSkeleton />
            <TaskCardSkeleton />
          </>
        : <SortableContext
            items={taskIds}
            strategy={verticalListSortingStrategy}
          >
            {tasks.length === 0 ?
              <div className="text-muted-foreground flex min-h-26 items-center justify-center rounded-md border border-dashed text-sm">
                No issues
              </div>
            : tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={onTaskClick}
                  onDelete={() => deleteTask({ id: task.id })}
                />
              ))
            }
          </SortableContext>
        }
      </div>
    </div>
  );
}
