import { cn } from "@/lib/utils";
import { KanbanBoardSkeleton } from "./kanban-board-skeleton";
import { TableSkeleton } from "./table-skeleton";

type BoardSkeletonProps = {
  viewMode?: "kanban" | "list";
  limit?: number;
  className?: string;
};

export const BoardSkeleton = ({
  viewMode = "kanban",
  limit = 50,
  className,
}: BoardSkeletonProps) => {
  if (viewMode === "list") {
    return (
      <TableSkeleton
        columns={8}
        rows={10}
      />
    );
  }

  return (
    <div className={cn("flex flex-wrap content-start gap-3 pt-2", className)}>
      {Array.from({ length: limit }).map((_, index) => (
        <KanbanBoardSkeleton key={index} />
      ))}
    </div>
  );
};
