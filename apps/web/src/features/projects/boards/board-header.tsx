"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";

import { PageTitle } from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsPage } from "@/hooks/is-page";
import { useTRPC } from "@/trpc";
import { CreateTaskButton } from "../kanban/create-task-button";
import { KanbanTabs } from "../kanban/kanban-tabs";
import { useKanbanSearchParams } from "../kanban/search-params";
import { SummaryTabs } from "../summary/summary-tabs";

export function BoardHeader() {
  const params = useParams<{ projectId: string; boardId: string }>();
  const { projectId, boardId } = params;

  const trpc = useTRPC();
  const { data: board } = useQuery(trpc.project.getBoard.queryOptions({ boardId }));
  const { data: users = [] } = useQuery(trpc.project.getProjectMembers.queryOptions({ projectId }));
  // Kanban is the base route; summary is nested under `/summary`.
  const isSummaryPage = useIsPage("/projects/[projectId]/boards/[boardId]/summary");
  const columns = board?.columns ?? [];
  const { searchParams } = useKanbanSearchParams();

  return (
    <div className="flex shrink-0 flex-col gap-4 py-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          asChild
        >
          <Link href={`/projects/${projectId}`}>
            <ChevronLeft className="size-4" />
            <span className="sr-only">Back to boards</span>
          </Link>
        </Button>
        <PageTitle
          title={board?.name ?? "Board"}
          className="w-full"
        >
          {columns.length > 0 && (
            <CreateTaskButton
              projectId={projectId}
              boardId={boardId}
              columns={columns.map((col) => ({ id: col.id, name: col.name }))}
              users={users}
              defaultColumnId={columns[0]?.id}
            />
          )}
        </PageTitle>
      </div>
      <TabsList className="w-full border-b">
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="kanban">
          {searchParams.viewMode === "kanban" ? "Kanban" : "List"}
        </TabsTrigger>
        {isSummaryPage && <SummaryTabs />}
        {!isSummaryPage && <KanbanTabs projectId={projectId} />}
      </TabsList>
    </div>
  );
}
