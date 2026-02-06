import { Skeleton } from "@/components/ui/skeleton";

export function BoardCardSkeleton() {
  return (
    <div className="bg-muted/30 flex h-[100px] items-center gap-3 rounded-lg border p-4">
      <Skeleton className="size-10 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-3 w-16 rounded" />
      </div>
    </div>
  );
}

export function BoardsListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <BoardCardSkeleton key={index} />
      ))}
    </div>
  );
}
