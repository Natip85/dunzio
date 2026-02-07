import { DashboardHeader } from "@/features/admin/dashboard/header";
import { AdminDashboardTabs } from "@/features/admin/dashboard/tabs";
import { HydrateClient, prefetch, trpc } from "@/utils/trpc";

export default function AdminDashboardPage() {
  // Overview tab - HeroStats
  prefetch(trpc.admin.getUserStats.queryOptions());
  prefetch(trpc.admin.getSessionStats.queryOptions());
  prefetch(trpc.admin.getQuestionStats.queryOptions());
  prefetch(trpc.admin.getAvgTimeStats.queryOptions());
  prefetch(trpc.admin.getHintsStats.queryOptions());
  // Overview tab - Charts
  prefetch(trpc.admin.getWeeklyActivity.queryOptions());
  prefetch(trpc.admin.getQuestionTypeStats.queryOptions());
  // Sessions tab
  prefetch(trpc.admin.getPeakHours.queryOptions());
  // Performance tab
  prefetch(trpc.admin.getTopicPerformance.queryOptions());
  prefetch(trpc.admin.getDifficultyStats.queryOptions());
  // Users tab
  prefetch(trpc.admin.getTopLearners.queryOptions());
  // Note: LiveFeed not prefetched since it auto-refreshes every 10s

  return (
    <HydrateClient>
      <div className="bg-background min-h-screen">
        <DashboardHeader />
        <AdminDashboardTabs />
      </div>
    </HydrateClient>
  );
}
