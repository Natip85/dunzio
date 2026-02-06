"use client";

import type {
  CollisionDetection,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import { useMemo, useRef, useState } from "react";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPortal } from "react-dom";

import type { Task } from "./task-card";
import { KanbanBoardSkeleton } from "@/features/loaders";
import { useTRPC } from "@/trpc";
import { AddColumnDialog } from "./add-column-dialog";
import { KanbanColumn } from "./kanban-column";
import { useKanbanSearchParams } from "./search-params";
import { TaskCard } from "./task-card";

type KanbanBoardProps = {
  boardId: string;
};

type ActiveDragItem =
  | { type: "column"; id: string }
  | { type: "task"; id: string; task: Task }
  | null;

export function KanbanBoard({ boardId }: KanbanBoardProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { filter, openIssue } = useKanbanSearchParams();

  const handleTaskClick = (taskId: string) => {
    void openIssue(taskId);
  };

  const boardQueryKey = trpc.project.getBoard.queryKey({ boardId });

  const { data: board, isLoading } = useQuery(trpc.project.getBoard.queryOptions({ boardId }));

  const [activeItem, setActiveItem] = useState<ActiveDragItem>(null);
  const isDraggingAnything = activeItem !== null;
  const isDraggingColumn = activeItem?.type === "column";
  const isDraggingTask = activeItem?.type === "task";

  // Horizontal scroller for the board (columns overflow).
  // We intentionally implement our own task-only horizontal drag-to-scroll so ONLY this element scrolls,
  // and we never re-introduce the huge "empty space" that dnd-kit's ancestor autoScroll can create.
  const boardRegionRef = useRef<HTMLDivElement | null>(null);
  const autoScrollRafRef = useRef<number | null>(null);
  const autoScrollVelocityRef = useRef(0);

  const stopAutoScroll = () => {
    autoScrollVelocityRef.current = 0;
    if (autoScrollRafRef.current != null) {
      cancelAnimationFrame(autoScrollRafRef.current);
      autoScrollRafRef.current = null;
    }
  };

  const ensureAutoScrollRunning = () => {
    if (autoScrollRafRef.current != null) return;

    const tick = () => {
      const el = boardRegionRef.current;
      const v = autoScrollVelocityRef.current;
      if (el && v !== 0) {
        el.scrollLeft += v;
        autoScrollRafRef.current = requestAnimationFrame(tick);
        return;
      }
      autoScrollRafRef.current = null;
    };

    autoScrollRafRef.current = requestAnimationFrame(tick);
  };

  // Track pending task moves for optimistic updates
  const pendingMoveRef = useRef<{
    taskId: string;
    fromColumnId: string | null;
    toColumnId: string;
    newPosition: number;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const columns = useMemo(() => board?.columns ?? [], [board?.columns]);
  const columnIds = useMemo(() => columns.map((col) => col.id), [columns]);

  const activeColumn = useMemo(
    () => (activeItem?.type === "column" ? columns.find((col) => col.id === activeItem.id) : null),
    [columns, activeItem]
  );

  const activeTask = useMemo(
    () => (activeItem?.type === "task" ? activeItem.task : null),
    [activeItem]
  );

  // Mutation for reordering columns
  const { mutateAsync: reorderColumnsMutation } = useMutation(
    trpc.project.reorderColumns.mutationOptions({
      onMutate: ({ columnIds: newOrder }) => {
        // Cancel outgoing refetches (fire and forget - must be sync for optimistic update to work)
        void queryClient.cancelQueries({ queryKey: boardQueryKey });

        // Snapshot previous value
        const previousBoard = queryClient.getQueryData(boardQueryKey);

        // Optimistically update
        queryClient.setQueryData(boardQueryKey, (old: typeof board) => {
          if (!old) return old;
          const reorderedColumns = newOrder
            .map((id, index) => {
              const col = old.columns.find((c) => c.id === id);
              return col ? { ...col, position: index } : null;
            })
            .filter((col): col is NonNullable<typeof col> => col !== null);
          return { ...old, columns: reorderedColumns };
        });

        return { previousBoard };
      },
      onError: (_err, _variables, context) => {
        // Rollback on error
        if (context?.previousBoard) {
          queryClient.setQueryData(boardQueryKey, context.previousBoard);
        }
      },
      onSettled: () => {
        // Refetch after mutation
        void queryClient.invalidateQueries({ queryKey: boardQueryKey });
      },
    })
  );

  // Mutation for moving tasks with optimistic updates
  const { mutate: moveTaskMutation } = useMutation(
    trpc.task.move.mutationOptions({
      /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any */
      onMutate: ({ taskId, newColumnId, newPosition }) => {
        // Cancel outgoing refetches (fire and forget - must be sync for optimistic update to work)
        void queryClient.cancelQueries();

        // Snapshot previous values for all columns
        const previousColumnData = new Map<string, unknown>();
        for (const col of columns) {
          const queryKey = trpc.task.getByColumn.queryKey({ columnId: col.id, filter });
          const tasks = queryClient.getQueryData(queryKey);
          if (tasks) {
            previousColumnData.set(col.id, tasks);
          }
        }

        // Find the task and its current column
        let movedTask: any = null;
        let sourceColumnId: string | null = null;

        for (const [columnId, tasks] of previousColumnData) {
          const tasksArray = tasks as any[];
          const task = tasksArray.find((t: any) => t.id === taskId);
          if (task) {
            movedTask = task;
            sourceColumnId = columnId;
            break;
          }
        }

        if (!movedTask || !sourceColumnId) {
          return { previousColumnData };
        }

        const taskToMove = movedTask;

        // Optimistically update the source column (remove task)
        if (sourceColumnId !== newColumnId) {
          const sourceQueryKey = trpc.task.getByColumn.queryKey({
            columnId: sourceColumnId,
            filter,
          });
          queryClient.setQueryData(sourceQueryKey, (old: any[] | undefined) => {
            if (!old) return old;
            return old
              .filter((t: any) => t.id !== taskId)
              .map((t: any, idx: number) => ({ ...t, position: idx }));
          });
        }

        // Optimistically update the target column (add/move task)
        const targetQueryKey = trpc.task.getByColumn.queryKey({ columnId: newColumnId, filter });
        queryClient.setQueryData(targetQueryKey, (old: any[] | undefined) => {
          if (!old) {
            return [{ ...taskToMove, columnId: newColumnId, position: newPosition }];
          }

          // Remove the task if it's already in this column (same column reorder)
          const filtered = old.filter((t: any) => t.id !== taskId);

          // Insert the task at the new position
          const updatedTask = { ...taskToMove, columnId: newColumnId, position: newPosition };
          const newTasks = [
            ...filtered.slice(0, newPosition),
            updatedTask,
            ...filtered.slice(newPosition),
          ];

          // Update positions
          return newTasks.map((t: any, idx: number) => ({ ...t, position: idx }));
        });

        return { previousColumnData };
      },
      onError: (_err, _variables, context) => {
        // Rollback on error
        if (context?.previousColumnData) {
          for (const [columnId, tasks] of context.previousColumnData) {
            const queryKey = trpc.task.getByColumn.queryKey({ columnId, filter });
            queryClient.setQueryData(queryKey, tasks as any);
          }
        }
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;

    if (activeData?.type === "column") {
      setActiveItem({ type: "column", id: active.id as string });
    } else if (activeData?.type === "task") {
      const task = activeData.task as Task;
      setActiveItem({ type: "task", id: active.id as string, task });
      pendingMoveRef.current = {
        taskId: task.id,
        fromColumnId: task.columnId,
        toColumnId: task.columnId ?? "",
        newPosition: task.position,
      };
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over || active.data.current?.type !== "task") {
      return;
    }

    const overData = over.data.current;

    // Determine target column
    let targetColumnId: string | null = null;

    if (overData?.type === "task") {
      // Dragging over another task
      targetColumnId = (overData.task as Task).columnId;
    } else if (overData?.type === "column-droppable") {
      // Dragging over a column droppable area
      targetColumnId = overData.columnId as string;
    } else if (overData?.type === "column") {
      // Dragging over a column itself
      targetColumnId = over.id as string;
    }

    if (targetColumnId && pendingMoveRef.current) {
      pendingMoveRef.current.toColumnId = targetColumnId;
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !board) {
      setActiveItem(null);
      pendingMoveRef.current = null;
      stopAutoScroll();
      return;
    }

    const activeData = active.data.current;

    // Handle column reordering
    if (activeData?.type === "column") {
      if (active.id === over.id) {
        setActiveItem(null);
        stopAutoScroll();
        return;
      }

      const oldIndex = columnIds.indexOf(active.id as string);
      const newIndex = columnIds.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(columnIds, oldIndex, newIndex);
        // Mutation fires optimistic update synchronously, then we clear overlay
        void reorderColumnsMutation({
          boardId: board.id,
          columnIds: newOrder,
        });
      }
      setActiveItem(null);
      stopAutoScroll();
      return;
    }

    // Handle task movement
    if (activeData?.type === "task" && pendingMoveRef.current) {
      const { taskId, fromColumnId, toColumnId } = pendingMoveRef.current;
      const overData = over.data.current;

      // Determine final column and position
      let finalColumnId = toColumnId;
      let newPosition = 0;

      if (overData?.type === "task") {
        // Dropped on a task
        const overTask = overData.task as { id: string; columnId: string | null };
        finalColumnId = overTask.columnId ?? toColumnId;

        // Get tasks in the target column
        const queryKey = trpc.task.getByColumn.queryKey({ columnId: finalColumnId, filter });
        const tasksInColumn = queryClient.getQueryData<{ id: string }[]>(queryKey) ?? [];

        // Find position of the task we're dropping on
        const overIndex = tasksInColumn.findIndex((t) => t.id === overTask.id);

        if (fromColumnId === finalColumnId) {
          // Same column - swap positions
          const activeIndex = tasksInColumn.findIndex((t) => t.id === taskId);
          if (activeIndex < overIndex) {
            newPosition = overIndex;
          } else {
            newPosition = overIndex;
          }
        } else {
          // Different column - insert at the position
          newPosition = overIndex;
        }
      } else if (overData?.type === "column-droppable" || overData?.type === "column") {
        // Dropped on a column (empty area)
        const colId =
          overData.type === "column-droppable" ?
            (overData.columnId as string)
          : (over.id as string);
        finalColumnId = colId;

        // Get tasks in the target column
        const queryKey = trpc.task.getByColumn.queryKey({ columnId: finalColumnId, filter });
        const tasksInColumn = queryClient.getQueryData<{ id: string }[]>(queryKey) ?? [];

        // Add to the end
        newPosition = tasksInColumn.filter((t) => t.id !== taskId).length;
      }

      // Only call mutation if something changed
      if (finalColumnId !== fromColumnId || newPosition !== pendingMoveRef.current.newPosition) {
        pendingMoveRef.current.toColumnId = finalColumnId;
        pendingMoveRef.current.newPosition = newPosition;

        // Mutation fires optimistic update synchronously in onMutate,
        // THEN we clear the overlay so the card appears in its new position
        moveTaskMutation({
          taskId,
          newColumnId: finalColumnId,
          newPosition,
        });
        setActiveItem(null);
        stopAutoScroll();
      } else {
        pendingMoveRef.current = null;
        setActiveItem(null);
        stopAutoScroll();
      }
    } else {
      setActiveItem(null);
      stopAutoScroll();
    }
  };

  const handleDragCancel = () => {
    setActiveItem(null);
    pendingMoveRef.current = null;
    stopAutoScroll();
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const el = boardRegionRef.current;
    if (!el) return;

    // dnd-kit doesn't provide pointer coordinates in DragMoveEvent, but it does provide
    // the live translated rect of the active draggable. We'll use its center point.
    const translated = event.active.rect.current.translated;
    if (!translated) return;

    const rect = el.getBoundingClientRect();
    const x = translated.left + translated.width / 2;
    const y = translated.top + translated.height / 2;

    // Only tasks should cause horizontal drag-to-scroll.
    if (!isDraggingTask) {
      stopAutoScroll();
      return;
    }

    // Only if pointer is vertically within the board region.
    if (y < rect.top || y > rect.bottom) {
      stopAutoScroll();
      return;
    }

    const edge = 90; // px "hot zone" near left/right
    const maxSpeed = 18; // px/frame

    const leftDist = x - rect.left;
    const rightDist = rect.right - x;

    let v = 0;
    if (leftDist < edge) {
      const t = Math.max(0, Math.min(1, (edge - leftDist) / edge));
      v = -Math.ceil(t * maxSpeed);
    } else if (rightDist < edge) {
      const t = Math.max(0, Math.min(1, (edge - rightDist) / edge));
      v = Math.ceil(t * maxSpeed);
    }

    autoScrollVelocityRef.current = v;
    if (v === 0) stopAutoScroll();
    else ensureAutoScrollRunning();
  };

  // Custom collision detection that works better with nested sortable contexts
  const collisionDetection: CollisionDetection = (args) => {
    // First try pointer within (more precise for tasks)
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }

    // Fall back to closest center for columns
    return closestCenter(args);
  };

  if (isLoading) {
    return <KanbanBoardSkeleton />;
  }

  if (!board) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">No board found for this project.</p>
      </div>
    );
  }

  if (columns.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">No columns configured. Add a column to get started.</p>
        <AddColumnDialog boardId={board.id} />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        // Disable dnd-kit's built-in autoScroll (it can scroll ancestors/layout and re-create the blank space).
        // We implement task-only horizontal scrolling ourselves in onDragMove.
        autoScroll={false}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {/* 
          IMPORTANT: In scroll containers, CSS transforms can expand scrollWidth.
          During column sorting, sibling columns are translated, which can "inflate"
          the horizontal scrollable area and reveal a big empty region to the right.
          
          We prevent that by:
          - Keeping the scroll container (outer) responsible for scrolling
          - Wrapping the translated children in an inner container that clips overflow
            only while dragging, so transforms can't increase outer scrollWidth.
        */}
        <div
          ref={boardRegionRef}
          className={`flex-1 overflow-auto pb-4 ${isDraggingColumn ? "overflow-x-hidden" : ""}`}
        >
          <div
            className={`flex w-max gap-4 pr-4 ${isDraggingAnything ? "overflow-clip" : "overflow-visible"}`}
          >
            <SortableContext
              items={columnIds}
              strategy={horizontalListSortingStrategy}
            >
              {columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  filter={filter}
                  siblingColumns={columns.map((c) => ({
                    id: c.id,
                    name: c.name,
                    color: c.color,
                  }))}
                  onTaskClick={handleTaskClick}
                />
              ))}
            </SortableContext>

            {/* Add Column Button */}
            <div className="flex shrink-0 items-start">
              <AddColumnDialog boardId={board.id} />
            </div>
          </div>
        </div>

        {typeof document !== "undefined" &&
          createPortal(
            <DragOverlay>
              {activeColumn ?
                <KanbanColumn
                  column={activeColumn}
                  isOverlay
                  filter={filter}
                  siblingColumns={columns.map((c) => ({
                    id: c.id,
                    name: c.name,
                    color: c.color,
                  }))}
                />
              : activeTask ?
                <TaskCard
                  task={activeTask}
                  isOverlay
                />
              : null}
            </DragOverlay>,
            document.body
          )}
      </DndContext>
    </div>
  );
}
