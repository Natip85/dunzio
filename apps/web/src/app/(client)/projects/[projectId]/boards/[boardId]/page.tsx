import type { SearchParams } from "nuqs";
import { Suspense } from "react";

import { TabsContent } from "@/components/ui/tabs";
import { KanbanBoardSkeleton } from "@/features/loaders";
import { BoardContent } from "@/features/projects/boards/board-content";
import { BoardHeader } from "@/features/projects/boards/board-header";
import { loadKanbanSearchParams } from "@/features/projects/kanban/search-params";

type PageProps = {
  params: Promise<{ projectId: string; boardId: string }>;
  searchParams: Promise<SearchParams>;
};

export default async function BoardKanbanPage({ params, searchParams }: PageProps) {
  const { boardId } = await params;
  await loadKanbanSearchParams(searchParams);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden pr-4.5 pl-6">
      <BoardHeader />
      <TabsContent
        value="kanban"
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <Suspense fallback={<KanbanBoardSkeleton />}>
          <BoardContent boardId={boardId} />
        </Suspense>
      </TabsContent>
    </div>
  );
}
