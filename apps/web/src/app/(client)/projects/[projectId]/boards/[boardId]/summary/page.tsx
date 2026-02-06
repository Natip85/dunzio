import { Suspense } from "react";

import { TabsContent } from "@/components/ui/tabs";
import { BoardHeader } from "@/features/projects/boards/board-header";

export default function BoardSummaryPage() {
  return (
    <div className="flex h-full flex-col overflow-hidden pr-4.5 pl-6">
      <BoardHeader />
      <TabsContent value="summary">
        <Suspense fallback={<div>Loading...</div>}>
          {/* <KanbanBoard boardId={boardId} /> */}summary stuff
        </Suspense>
      </TabsContent>
    </div>
  );
}
