import { Skeleton } from "@/components/ui/skeleton";

export function NavMainSkeleton() {
  return (
    <div className="space-y-2 px-2 py-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-2"
        >
          <Skeleton className="size-4 rounded" />
          <Skeleton className="h-4 w-28 rounded" />
        </div>
      ))}
    </div>
  );
}
