import { TabsContent } from "@/components/ui/tabs";
import { BoardHeader } from "@/features/projects/boards/board-header";
import { SummaryContent } from "@/features/projects/summary/summary-content";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

type BoardSummaryPageProps = {
  params: Promise<{ projectId: string; boardId: string }>;
};

export default async function BoardSummaryPage({ params }: BoardSummaryPageProps) {
  const { boardId } = await params;

  // Prefetch all summary data for SSR
  prefetch(trpc.boardSummary.getHeroStats.queryOptions({ boardId }));
  prefetch(trpc.boardSummary.getStatusOverview.queryOptions({ boardId }));
  prefetch(trpc.boardSummary.getRecentActivity.queryOptions({ boardId }));
  prefetch(trpc.boardSummary.getPriorityBreakdown.queryOptions({ boardId }));
  prefetch(trpc.boardSummary.getTypesOfWork.queryOptions({ boardId }));
  prefetch(trpc.boardSummary.getTeamWorkload.queryOptions({ boardId }));
  prefetch(trpc.boardSummary.getEpicProgress.queryOptions({ boardId }));

  return (
    <HydrateClient>
      <div className="flex h-full flex-col overflow-hidden pr-4.5 pl-6">
        <BoardHeader />
        <TabsContent
          value="summary"
          className="mt-0 flex-1 overflow-y-auto"
        >
          <SummaryContent boardId={boardId} />
        </TabsContent>
      </div>
    </HydrateClient>
  );
}
