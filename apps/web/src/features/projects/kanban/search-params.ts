import { useMemo } from "react";
import { debounce } from "lodash-es";
import { useQueryStates } from "nuqs";
import { createLoader, parseAsJson, parseAsString, parseAsStringLiteral } from "nuqs/server";
import z from "zod";

import type { IssueFilter } from "@dunzio/db/validators";
import { issueFilterSchema } from "@dunzio/db/validators";

export const swimlaneOptions = ["none", "assignee", "epic", "priority", "type", "sprint"] as const;
export type SwimlaneOption = (typeof swimlaneOptions)[number];

export const defaultIssueFilter: IssueFilter = {};

const viewModeSchema = z.enum(["kanban", "list"]);
export type ViewMode = z.infer<typeof viewModeSchema>;

export const kanbanSearchParamsParser = {
  selectedIssue: parseAsString,
  swimlane: parseAsStringLiteral(swimlaneOptions).withDefault("none"),
  filter: parseAsJson((value) => issueFilterSchema.optional().parse(value)).withDefault(
    defaultIssueFilter
  ),
  viewMode: parseAsJson((value) => viewModeSchema.parse(value)).withDefault("kanban"),
};

export const loadKanbanSearchParams = createLoader(kanbanSearchParamsParser);

export type KanbanSearchParams = Awaited<ReturnType<typeof loadKanbanSearchParams>>;

export const useKanbanSearchParams = ({ debounceMs = 300 }: { debounceMs?: number } = {}) => {
  const [searchParams, setSearchParams] = useQueryStates(kanbanSearchParamsParser);

  const debouncedSetSearchParams = useMemo(
    () => debounce(setSearchParams, debounceMs),
    [setSearchParams, debounceMs]
  );

  // Shorthand for the filter
  const filter = searchParams.filter;

  const openIssue = async (issueId: string) => {
    await setSearchParams({ selectedIssue: issueId });
  };

  const closeIssue = async () => {
    await setSearchParams({ selectedIssue: null });
  };

  // Update a specific filter field
  const setFilter = async (updates: Partial<IssueFilter>) => {
    await setSearchParams({
      filter: { ...filter, ...updates },
    });
  };

  // Toggle an array filter value (add if not present, remove if present)
  const toggleArrayFilter = async <K extends "assignees" | "types" | "priorities" | "labels">(
    key: K,
    value: string
  ) => {
    const current = (filter[key] as string[] | undefined) ?? [];
    const updated =
      current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    await setFilter({ [key]: updated.length > 0 ? updated : undefined });
  };

  const resetFilters = async (newFilter?: IssueFilter) => {
    await setSearchParams({
      filter: newFilter ?? defaultIssueFilter,
    });
  };

  const hasActiveFilters = useMemo(() => {
    const checks = [
      filter.q && filter.q !== "",
      filter.assignees && filter.assignees.length > 0,
      filter.reporter !== undefined,
      filter.types && filter.types.length > 0,
      filter.priorities && filter.priorities.length > 0,
      filter.sprint !== undefined,
      filter.epic !== undefined,
      filter.labels && filter.labels.length > 0,
      filter.onlyMyIssues === true,
      filter.recentlyUpdated !== undefined,
      filter.hideDone === true,
      filter.hideSubtasks === true,
    ];
    return checks.some(Boolean);
  }, [filter]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filter.q && filter.q !== "") count++;
    if (filter.assignees && filter.assignees.length > 0) count++;
    if (filter.reporter !== undefined) count++;
    if (filter.types && filter.types.length > 0) count++;
    if (filter.priorities && filter.priorities.length > 0) count++;
    if (filter.sprint !== undefined) count++;
    if (filter.epic !== undefined) count++;
    if (filter.labels && filter.labels.length > 0) count++;
    if (filter.onlyMyIssues) count++;
    if (filter.recentlyUpdated !== undefined) count++;
    if (filter.hideDone) count++;
    if (filter.hideSubtasks) count++;
    return count;
  }, [filter]);

  return {
    searchParams,
    setSearchParams,
    debouncedSetSearchParams,
    filter,
    setFilter,
    openIssue,
    closeIssue,
    toggleArrayFilter,
    resetFilters,
    hasActiveFilters,
    activeFilterCount,
  };
};

export type KanbanFilter = IssueFilter;
