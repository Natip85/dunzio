"use client";

import type { AnimateLayoutChanges } from "@dnd-kit/sortable";
import type { CSSProperties, MouseEvent } from "react";
import { useRef } from "react";
import { defaultAnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreVertical, UserIcon } from "lucide-react";

import type { IssuePriority, IssueType } from "./schemas";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskCardGitHubBadge } from "@/features/github/task-card-github-badge";
import { cn } from "@/lib/utils";

export type Task = {
  id: string;
  key: string;
  title: string;
  type: IssueType;
  priority: IssuePriority;
  columnId: string | null;
  position: number;
  storyPoints?: number | null;
  assignee?: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
};

type TaskCardProps = {
  task: Task;
  isOverlay?: boolean;
  onClick?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
};

export const priorityColors: Record<IssuePriority, string> = {
  lowest: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  low: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  highest: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export const typeIcons: Record<IssueType, string> = {
  epic: "⚡",
  story: "📖",
  task: "✓",
  bug: "🐛",
  subtask: "◇",
};

// Prevent snap-back animation when dropping a dragged item
const animateLayoutChanges: AnimateLayoutChanges = (args) => {
  const { wasDragging } = args;
  // Don't animate if we just finished dragging - prevents the snap-back effect
  if (wasDragging) {
    return false;
  }
  return defaultAnimateLayoutChanges(args);
};

function SortableTaskCard({ task, onClick, onDelete }: Omit<TaskCardProps, "isOverlay">) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task,
    },
    animateLayoutChanges,
  });

  // Track mouse position to differentiate click from drag
  const mouseDownPosRef = useRef<{ x: number; y: number } | null>(null);

  // When using <DragOverlay />, we don't want the "real" element to translate with the pointer.
  // A translated element inside an overflow-x container can expand scrollWidth, causing the
  // container (and sometimes the whole layout) to appear to "shift" when you drag far.
  const style: CSSProperties = {
    transform: isDragging ? undefined : CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
  };

  const handleMouseDown = (e: MouseEvent) => {
    mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleClick = (e: MouseEvent) => {
    if (!onClick || !mouseDownPosRef.current) return;

    // Calculate distance moved - if less than threshold, it's a click not a drag
    const dx = Math.abs(e.clientX - mouseDownPosRef.current.x);
    const dy = Math.abs(e.clientY - mouseDownPosRef.current.y);
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Use a small threshold (less than dnd-kit's 8px activation distance)
    if (distance < 5) {
      onClick(task.id);
    }

    mouseDownPosRef.current = null;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      className={cn(
        "group bg-background hover:border-primary/50 cursor-grab rounded-md border p-3 shadow-sm transition-colors",
        isDragging && "pointer-events-none opacity-0"
      )}
    >
      <div>
        <div className="flex items-center justify-between">
          {/* Task Key & Type */}
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs">{typeIcons[task.type]}</span>
            <span className="text-muted-foreground text-xs font-medium">{task.key}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              asChild
              className="opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Button
                variant="ghost"
                size="icon-sm"
              >
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(task.id);
                }}
              >
                Delete task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title */}
        <p className="mb-3 line-clamp-2 text-sm font-medium">{task.title}</p>
      </div>
      {/* Footer: Priority, Story Points, GitHub Badge, Assignee */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={cn("text-xs", priorityColors[task.priority])}
          >
            {task.priority}
          </Badge>
          {task.storyPoints != null && (
            <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs">
              {task.storyPoints} SP
            </span>
          )}
          <TaskCardGitHubBadge issueId={task.id} />
        </div>

        <Avatar className="h-6 w-6">
          {task.assignee ?
            <>
              <AvatarImage src={task.assignee.image ?? undefined} />
              <AvatarFallback className="text-xs">
                {task.assignee.name?.charAt(0) ?? ""}
              </AvatarFallback>
            </>
          : <AvatarFallback className="bg-muted text-muted-foreground text-xs">
              {" "}
              <UserIcon className="size-4" />
            </AvatarFallback>
          }
        </Avatar>
      </div>
    </div>
  );
}

function TaskCardOverlay({ task }: Pick<TaskCardProps, "task">) {
  // IMPORTANT:
  // This is rendered inside <DragOverlay /> and must be presentational only.
  // Do NOT call useSortable here, otherwise dnd-kit will see duplicate nodes
  // with the same id during drag, which can cause measurement jitter/layout shifts.
  return (
    <div
      className={cn(
        "bg-background cursor-grabbing rounded-md border p-3 shadow-sm",
        "ring-primary pointer-events-none shadow-lg ring-2"
      )}
    >
      <div>
        <div className="flex items-center justify-between">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs">{typeIcons[task.type]}</span>
            <span className="text-muted-foreground text-xs font-medium">{task.key}</span>
          </div>
          {/* Menu is omitted in overlay to avoid focus/layout interactions */}
        </div>

        <p className="mb-3 line-clamp-2 text-sm font-medium">{task.title}</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={cn("text-xs", priorityColors[task.priority])}
          >
            {task.priority}
          </Badge>
          {task.storyPoints != null && (
            <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs">
              {task.storyPoints} SP
            </span>
          )}
        </div>

        <Avatar className="h-6 w-6">
          {task.assignee ?
            <>
              <AvatarImage src={task.assignee.image ?? undefined} />
              <AvatarFallback className="text-xs">
                {task.assignee.name?.charAt(0) ?? ""}
              </AvatarFallback>
            </>
          : <AvatarFallback className="bg-muted text-muted-foreground text-xs"></AvatarFallback>}
        </Avatar>
      </div>
    </div>
  );
}

export function TaskCard({ task, isOverlay, onClick, onDelete }: TaskCardProps) {
  if (isOverlay) {
    return <TaskCardOverlay task={task} />;
  }

  return (
    <SortableTaskCard
      task={task}
      onClick={onClick}
      onDelete={onDelete}
    />
  );
}
