import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function OrgSwitcherSkeleton({ isCollapsed = false }: { isCollapsed?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2 px-2 py-2", isCollapsed && "justify-center px-0")}>
      <Skeleton className="h-8 w-8 rounded-md" />
      {!isCollapsed && <Skeleton className="h-4 w-24 rounded" />}
    </div>
  );
}
