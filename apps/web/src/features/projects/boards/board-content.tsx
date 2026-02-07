"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { Folder, Search } from "lucide-react";

import {
  ListRenderer,
  ListRendererEmpty,
  ListRendererList,
  ListRendererListItem,
  ListRendererLoading,
  ListRendererNoResults,
} from "@/components/list-renderer";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { BoardTableBulkActions } from "@/features/table/board-table-bulk-actions";
import { useBoardTableParams } from "@/features/table/board-table-params";
import { DataTable } from "@/features/table/data-table";
import { useTRPC } from "@/trpc";
import { EditTaskDialog } from "../kanban/edit-task-dialog";
import { KanbanBoard } from "../kanban/kanban-board";
import { useKanbanSearchParams } from "../kanban/search-params";

type BoardContentProps = {
  boardId: string;
};

export function BoardContent({ boardId }: BoardContentProps) {
  const trpc = useTRPC();
  const { searchParams, filter, openIssue } = useKanbanSearchParams();
  const { columnVisibility, orderedColumns } = useBoardTableParams();

  const { data: board, isLoading } = useQuery(trpc.project.getBoard.queryOptions({ boardId }));

  const projectId = board?.project?.id;
  const { data: users = [] } = useQuery({
    ...trpc.project.getProjectMembers.queryOptions({ projectId: projectId ?? "" }),
    enabled: !!projectId,
  });

  const columns = board?.columns ?? [];
  const hasSearch = Boolean(filter.q && filter.q.length > 0);

  const taskQueries = useQueries({
    queries: columns.map((col) => trpc.task.getByColumn.queryOptions({ columnId: col.id, filter })),
  });

  const hasColumns = columns.length > 0;
  const hasFilteredTasks = taskQueries.some((q) => Array.isArray(q.data) && q.data.length > 0);

  const hasData = hasSearch ? hasFilteredTasks : hasColumns;

  return (
    <>
      <ListRenderer
        hasData={hasData}
        isLoading={isLoading}
        hasSearch={hasSearch}
        viewMode={searchParams.viewMode}
      >
        <ListRendererLoading />

        <ListRendererEmpty>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Folder />
              </EmptyMedia>
              <EmptyTitle>No Board Found</EmptyTitle>
              <EmptyDescription>
                You haven&apos;t created any boards yet. Get started by creating your first board.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
              <Button>Create Board</Button>
            </EmptyContent>
          </Empty>
        </ListRendererEmpty>

        <ListRendererNoResults>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Search />
              </EmptyMedia>
              <EmptyTitle>No Results Found</EmptyTitle>
              <EmptyDescription>No results found for your search.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </ListRendererNoResults>

        <ListRendererList className="flex min-h-0 flex-1 flex-col">
          <ListRendererListItem type="kanban">
            <KanbanBoard boardId={boardId} />
          </ListRendererListItem>

          <ListRendererListItem type={"list"}>
            <DataTable
              columns={orderedColumns}
              data={taskQueries.flatMap((q) => q.data ?? [])}
              columnVisibility={columnVisibility}
              onClick={(row) => {
                void openIssue(row.id);
              }}
              renderBulkActions={({ selectedRows, table }) => (
                <BoardTableBulkActions
                  selectedRows={selectedRows}
                  table={table}
                  users={users}
                />
              )}
            />
          </ListRendererListItem>
        </ListRendererList>
      </ListRenderer>

      <EditTaskDialog
        columns={columns.map((c) => ({ id: c.id, name: c.name }))}
        users={users}
      />
    </>
  );
}
