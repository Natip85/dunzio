"use client";

import { useQuery } from "@tanstack/react-query";

import type { IssueType } from "@dunzio/db/validators";

import { TabsListRight } from "@/components/ui/tabs";
import { useBoardTableParams } from "@/features/table/board-table-params";
import { useTRPC } from "@/trpc";
import { AssigneeFilterPopover } from "./assignee-filter-popover";
import { KanbanListControls } from "./kanban-list-controls";
import { useKanbanSearchParams } from "./search-params";
import { TypeFilterPopover } from "./type-filter-popover";

type KanbanTabsProps = {
  projectId: string;
};

export function KanbanTabs({ projectId }: KanbanTabsProps) {
  const trpc = useTRPC();
  const {
    searchParams,
    setSearchParams,
    filter,
    setFilter,
    toggleArrayFilter,
    activeFilterCount,
    resetFilters,
  } = useKanbanSearchParams();
  const tableParams = useBoardTableParams();
  // Fetch project members for assignee filter
  const { data: users = [] } = useQuery(trpc.project.getProjectMembers.queryOptions({ projectId }));

  const selectedTypes = filter.types ?? [];
  const selectedAssignees = filter.assignees ?? [];
  const searchValue = filter.q ?? "";

  const handleSearchChange = (value: string) => {
    void setFilter({ q: value || undefined });
  };

  const handleSearchReset = () => {
    void setFilter({ q: undefined });
  };

  const handleToggleType = (type: IssueType) => {
    void toggleArrayFilter("types", type);
  };

  const handleClearTypeFilters = () => {
    void setFilter({ types: undefined });
  };

  const handleToggleAssignee = (assigneeId: string) => {
    void toggleArrayFilter("assignees", assigneeId);
  };

  const handleClearAssigneeFilters = () => {
    void setFilter({ assignees: undefined });
  };

  return (
    <TabsListRight className="bg-background flex w-full min-w-28 items-center justify-end gap-2">
      <KanbanListControls
        tableParams={tableParams}
        inputValue={searchValue}
        filterCount={activeFilterCount}
        viewMode={searchParams.viewMode}
        viewModes={["kanban", "list"]}
        onInputChange={handleSearchChange}
        onSetViewMode={(mode) => void setSearchParams({ viewMode: mode })}
        onReset={handleSearchReset}
        onClearFilters={() => void resetFilters()}
        filterButton={
          <div className="flex items-center gap-2">
            <AssigneeFilterPopover
              users={users}
              selectedAssignees={selectedAssignees}
              onToggleAssignee={handleToggleAssignee}
              onClearAll={handleClearAssigneeFilters}
            />
            <TypeFilterPopover
              selectedTypes={selectedTypes}
              onToggleType={handleToggleType}
              onClearAll={handleClearTypeFilters}
            />
          </div>
        }
      />
    </TabsListRight>
  );
}
