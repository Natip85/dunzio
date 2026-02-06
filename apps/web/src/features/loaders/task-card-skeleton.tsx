import { Skeleton } from "@/components/ui/skeleton";

export function TaskCardSkeleton() {
  return (
    <div className="bg-background rounded-md border p-3 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-3 w-16 rounded" />
      </div>
      <Skeleton className="mb-3 h-4 w-full rounded" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-16 rounded" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
    </div>
  );
}
