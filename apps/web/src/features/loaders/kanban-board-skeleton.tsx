import { Skeleton } from "@/components/ui/skeleton";

export function KanbanBoardSkeleton() {
  return (
    <div className="flex h-full gap-4 overflow-x-auto pb-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="bg-muted/30 flex w-72 shrink-0 flex-col gap-3 border p-3"
        >
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="ml-auto h-5 w-6 rounded-full" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-20 w-full rounded-md" />
            <Skeleton className="h-20 w-full rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
