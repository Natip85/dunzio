"use client";

import type { RefObject } from "react";
import { useRef } from "react";
import { ChevronDownIcon, Columns3, EllipsisVertical, Filter, List, Table } from "lucide-react";
import { useResizeObserver } from "usehooks-ts";

import type { ViewMode } from "./search-params";
import type { GenericTableReturn } from "@/features/table/use-table-params";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ColumnsMenu } from "../../table/columns-menu";

const viewModeIcons: Record<ViewMode, React.ComponentType<{ className?: string }>> = {
  kanban: Columns3,
  list: List,
};

const FilterButton = ({
  filterCount,
  filterOpen,
  onFilterClick,
}: {
  filterCount: number;
  filterOpen?: boolean;
  onFilterClick?: () => void;
}) => {
  return (
    <Button
      size="sm"
      onClick={onFilterClick}
      className="flex transition-all duration-300 ease-in-out"
      disabled={!onFilterClick}
    >
      {filterCount > 0 ?
        <Badge className="bg-sienna-700 text-sienna-200!">{filterCount}</Badge>
      : <Filter className="size-4" />}
      Filter
      <ChevronDownIcon
        className={cn("size-4 transition-transform duration-200", filterOpen && "rotate-180")}
      />
    </Button>
  );
};

export type ListControls<V extends ViewMode> = {
  inputValue: string;
  filterCount: number;
  handleInputChange: (value: string) => void;
  handleSetViewMode: (mode: V) => void;
  reset: () => void;
};

export type ListControlsBaseProps = {
  onFilterClick?: () => void;
  filterOpen?: boolean;
  totalBadge?: React.ReactNode;
};

export type KanbanListControlsProps<
  T,
  TColumnsList extends Record<string, boolean>[],
> = ListControlsBaseProps & {
  /** Current search input value */
  inputValue: string;
  /** Number of active filters (shown in badge) */
  filterCount: number;
  /** Current view mode */
  viewMode: ViewMode;
  /** Available view modes to toggle between */
  viewModes: ViewMode[];
  /** Callback when search input changes */
  onInputChange: (value: string) => void;
  /** Callback when view mode is changed */
  onSetViewMode: (mode: ViewMode) => void;
  /** Callback to reset/clear search */
  onReset: () => void;
  /** Custom filter button/popover (e.g., TypeFilterPopover) */
  filterButton?: React.ReactNode;
  /** Callback when default filter button is clicked (if no filterButton provided) */
  onFilterClick?: () => void;
  /** Whether the filter panel is open (for chevron rotation) */
  filterOpen?: boolean;
  /** Optional badge showing total count */
  totalBadge?: React.ReactNode;
  /** Callback to clear filters */
  onClearFilters?: () => void;
  tableParams: GenericTableReturn<T, TColumnsList>;
};

// export type KanbanListControlsProps = {
//   /** Current search input value */
//   inputValue: string;
//   /** Number of active filters (shown in badge) */
//   filterCount: number;
//   /** Current view mode */
//   viewMode: ViewMode;
//   /** Available view modes to toggle between */
//   viewModes: ViewMode[];
//   /** Callback when search input changes */
//   onInputChange: (value: string) => void;
//   /** Callback when view mode is changed */
//   onSetViewMode: (mode: ViewMode) => void;
//   /** Callback to reset/clear search */
//   onReset: () => void;
//   /** Custom filter button/popover (e.g., TypeFilterPopover) */
//   filterButton?: React.ReactNode;
//   /** Callback when default filter button is clicked (if no filterButton provided) */
//   onFilterClick?: () => void;
//   /** Whether the filter panel is open (for chevron rotation) */
//   filterOpen?: boolean;
//   /** Optional badge showing total count */
//   totalBadge?: React.ReactNode;
//   /** Callback to clear filters */
//   onClearFilters?: () => void;
//   tableParams: GenericTableReturn<T, TColumnsList>;
// };

const LG = 740;
const MD = 620;
const XS = 420;

export const KanbanListControls = <T, TColumnsList extends Record<string, boolean>[]>({
  totalBadge,
  viewModes,
  viewMode,
  onFilterClick,
  filterOpen,
  filterButton,
  filterCount,
  onSetViewMode,
  onInputChange,
  inputValue,
  onReset,
  onClearFilters,
  tableParams: { columnOptions, toggleColumnVisibility, updateColumnOrder, resetTableParams },
}: KanbanListControlsProps<T, TColumnsList>) => {
  const ref = useRef<HTMLDivElement>(null);
  const { width = Infinity } = useResizeObserver({
    ref: ref as RefObject<HTMLElement>,
    box: "border-box",
  });

  const filterInMenu = width >= LG;
  const viewInMenu = width >= MD;
  const searchInMenu = width >= XS;
  const showMoreMenu = !filterInMenu || !viewInMenu || !searchInMenu;

  return (
    <div
      className="flex w-full min-w-28 items-center justify-end gap-2"
      ref={ref}
    >
      {totalBadge}

      {viewInMenu && (
        <ToggleGroup
          variant="outline"
          className="transition-all duration-300 ease-in-out"
          value={viewMode}
          type="single"
        >
          {viewModes.map((mode) => {
            const ModeIcon = viewModeIcons[mode];
            return (
              <ToggleGroupItem
                variant="outline"
                key={mode}
                value={mode}
                aria-label={`${mode} view`}
                onClick={() => onSetViewMode(mode)}
                className="min-w-8"
              >
                <ModeIcon className="size-4" />
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      )}

      {searchInMenu && (
        <Input
          id="kanban-search"
          type="text"
          onClear={onReset}
          showSearch
          className={cn(
            "transition-all duration-300 ease-in-out",
            width > LG ? "w-[252px]" : "w-[180px]"
          )}
          placeholder="Search board..."
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
        />
      )}

      {viewInMenu && (
        <Popover>
          <PopoverTrigger
            asChild
            className="flex transition-all duration-300 ease-in-out"
          >
            <Button
              variant="outline"
              disabled={viewMode !== "list"}
            >
              <Table /> View
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            {viewMode === "list" && (
              <ColumnsMenu
                columns={columnOptions}
                onColumnToggle={toggleColumnVisibility}
                onColumnReorder={updateColumnOrder}
                onReset={resetTableParams}
              />
            )}
          </PopoverContent>
        </Popover>
      )}

      {filterInMenu &&
        (filterButton ?? (
          <FilterButton
            filterCount={filterCount}
            filterOpen={filterOpen}
            onFilterClick={onFilterClick}
          />
        ))}

      <Button
        variant="ghost"
        onClick={onClearFilters}
      >
        Clear Filters
      </Button>

      {/* More options dropdown - shows when elements are hidden due to narrow width */}
      {showMoreMenu && (
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="transition-all duration-300 ease-in-out"
                >
                  <EllipsisVertical className="size-4" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>More options</p>
            </TooltipContent>
          </Tooltip>
          <PopoverContent
            align="end"
            className="bg-background flex w-fit max-w-[75vw] flex-wrap items-center gap-2"
          >
            {!viewInMenu && (
              <Popover>
                <PopoverTrigger
                  asChild
                  className="flex transition-all duration-300 ease-in-out"
                >
                  <Button
                    size="sm"
                    disabled={viewMode !== "list"}
                  >
                    <Table /> View
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  {viewMode === "list" && (
                    <ColumnsMenu
                      columns={columnOptions}
                      onColumnToggle={toggleColumnVisibility}
                      onColumnReorder={updateColumnOrder}
                      onReset={resetTableParams}
                    />
                  )}
                </PopoverContent>
              </Popover>
            )}
            {!viewInMenu && (
              <ToggleGroup
                className="transition-all duration-300 ease-in-out"
                value={viewMode}
                type="single"
              >
                {viewModes.map((mode) => {
                  const ModeIcon = viewModeIcons[mode];
                  return (
                    <ToggleGroupItem
                      key={mode}
                      value={mode}
                      aria-label={`${mode} view`}
                      onClick={() => onSetViewMode(mode)}
                      className="min-w-8"
                    >
                      <ModeIcon className="size-4" />
                    </ToggleGroupItem>
                  );
                })}
              </ToggleGroup>
            )}

            {!searchInMenu && (
              <Input
                type="text"
                size="sm"
                onClear={onReset}
                showSearch
                className="transition-all duration-300 ease-in-out"
                placeholder="Search board..."
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value)}
              />
            )}

            {!filterInMenu &&
              (filterButton ?? (
                <FilterButton
                  filterCount={filterCount}
                  filterOpen={filterOpen}
                  onFilterClick={onFilterClick}
                />
              ))}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
