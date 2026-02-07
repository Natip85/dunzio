import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function HeroStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-card flex items-center gap-3 rounded-xl border p-4"
        >
          <Skeleton className="size-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatusDonutSkeleton() {
  return (
    <Card className="h-full rounded-xl border p-5">
      <Skeleton className="mb-1 h-5 w-32" />
      <Skeleton className="mb-4 h-3 w-52" />
      <div className="flex items-center justify-center py-8">
        <Skeleton className="size-[180px] rounded-full" />
      </div>
      <div className="flex gap-4 pt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-3 w-16"
          />
        ))}
      </div>
    </Card>
  );
}

export function RecentActivitySkeleton() {
  return (
    <Card className="h-full rounded-xl border p-5">
      <Skeleton className="mb-1 h-5 w-32" />
      <Skeleton className="mb-4 h-3 w-56" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-3"
          >
            <Skeleton className="size-6 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function PriorityBreakdownSkeleton() {
  return (
    <Card className="h-full rounded-xl border p-5">
      <Skeleton className="mb-1 h-5 w-36" />
      <Skeleton className="mb-4 h-3 w-56" />
      <Skeleton className="h-[220px] w-full" />
    </Card>
  );
}

export function TypesOfWorkSkeleton() {
  return (
    <Card className="h-full rounded-xl border p-5">
      <Skeleton className="mb-1 h-5 w-28" />
      <Skeleton className="mb-4 h-3 w-52" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 flex-1" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function TeamWorkloadSkeleton() {
  return (
    <Card className="h-full rounded-xl border p-5">
      <Skeleton className="mb-1 h-5 w-32" />
      <Skeleton className="mb-4 h-3 w-44" />
      <div className="space-y-3.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3"
          >
            <div className="flex w-36 items-center gap-2">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-5 flex-1" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function EpicProgressSkeleton() {
  return (
    <Card className="h-full rounded-xl border p-5">
      <Skeleton className="mb-1 h-5 w-28" />
      <Skeleton className="mb-4 h-3 w-52" />
      <div className="space-y-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="space-y-2"
          >
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-5 w-full" />
          </div>
        ))}
      </div>
    </Card>
  );
}
