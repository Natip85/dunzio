"use client";
"use no memo";

import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  Row,
  RowSelectionState,
  SortingState,
  Table as TanTable,
  VisibilityState,
} from "@tanstack/react-table";
import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  renderBulkActions?: (args: {
    selectedRows: Row<TData>[];
    table: TanTable<TData>;
  }) => React.ReactNode;
  onClick?: (row: TData) => void;
};

export const DataTable = <TData, TValue>({
  columns,
  data,
  columnVisibility: externalColumnVisibility,
  onColumnVisibilityChange,
  renderBulkActions,
  onClick,
}: DataTableProps<TData, TValue>) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [internalColumnVisibility, setInternalColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Use external column visibility if provided, otherwise use internal state
  const columnVisibility = externalColumnVisibility ?? internalColumnVisibility;
  const setColumnVisibility = onColumnVisibilityChange ?? setInternalColumnVisibility;

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    initialState: {
      //   pagination: {
      //     pageIndex: page - 1,
      //     pageSize: perPage,
      //   },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const selectedRows = table.getSelectedRowModel().rows;
  const hasSelection = selectedRows.length > 0;

  return (
    <div className="relative w-full overflow-auto">
      <Table className="border contain-[paint]">
        <TableHeader className="bg-secondary">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className={cn(hasSelection && "border-secondary border-b")}
            >
              {headerGroup.headers.map((header) => {
                const isSelectHeader = header.column.id === "select";
                const isActionsHeader = header.column.id === "actions";
                const columnSize =
                  header.column.columnDef.maxSize ?
                    {
                      width: header.column.getSize(),
                      minWidth: header.column.getSize(),
                      maxWidth: header.column.columnDef.maxSize,
                    }
                  : undefined;
                if (hasSelection) {
                  if (header.index === 1) {
                    return (
                      <TableHead
                        key={header.id}
                        style={columnSize}
                        className={cn(
                          "text-foreground",
                          isSelectHeader &&
                            'after:content-[" "] bg-secondary after:bg-secondary dark:after:bg-secondary sticky left-0 z-30 px-3 text-center after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px',
                          isActionsHeader &&
                            'after:content-[" "] bg-secondary after:bg-secondary dark:after:bg-secondary sticky right-0 z-30 px-3 text-center after:absolute after:top-0 after:bottom-0 after:left-0 after:w-px'
                        )}
                      >
                        {selectedRows.length} row{selectedRows.length !== 1 ? "s" : ""} selected
                      </TableHead>
                    );
                  }
                  if (isActionsHeader) {
                    return (
                      <TableHead
                        key={header.id}
                        style={columnSize}
                        className='after:content-[" "] bg-secondary after:bg-secondary dark:after:bg-secondary sticky right-0 z-30 flex items-center justify-center px-3 after:absolute after:top-0 after:bottom-0 after:left-0 after:w-px'
                      >
                        {renderBulkActions?.({ selectedRows, table })}
                      </TableHead>
                    );
                  }
                }
                return (
                  <TableHead
                    key={header.id}
                    style={columnSize}
                    className={cn(
                      hasSelection && header.id !== "select" && "opacity-0",
                      isSelectHeader &&
                        'after:content-[" "] bg-secondary after:bg-secondary dark:after:bg-secondary sticky left-0 z-30 px-3 text-center after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px',
                      isActionsHeader &&
                        'after:content-[" "] bg-secondary after:bg-secondary dark:after:bg-secondary sticky right-0 z-30 px-3 text-center after:absolute after:top-0 after:bottom-0 after:left-0 after:w-px'
                    )}
                  >
                    {header.isPlaceholder ? null : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        {/* } */}
        <TableBody>
          {table.getRowModel().rows?.length ?
            table.getRowModel().rows.map((row) => (
              <TableRow
                className={cn(
                  "hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer border-b transition-colors"
                )}
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => {
                  const isSelectCell = cell.column.id === "select";
                  const isActionsCell = cell.column.id === "actions";
                  const cellSize =
                    cell.column.columnDef.maxSize ?
                      {
                        width: cell.column.getSize(),
                        minWidth: cell.column.getSize(),
                        maxWidth: cell.column.columnDef.maxSize,
                      }
                    : undefined;
                  return (
                    <TableCell
                      key={cell.id}
                      style={cellSize}
                      className={cn(
                        isSelectCell &&
                          'after:content-[" "] bg-secondary after:bg-secondary dark:after:bg-secondary sticky left-0 z-20 px-3 text-center will-change-transform after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px',
                        isActionsCell &&
                          'after:content-[" "] bg-secondary after:bg-secondary dark:after:bg-secondary sticky right-0 z-20 px-3 text-center will-change-transform after:absolute after:top-0 after:bottom-0 after:left-0 after:w-px',
                        isActionsCell &&
                          hasSelection &&
                          "pointer-events-none bg-transparent opacity-30"
                      )}
                      onClick={() => {
                        if (isActionsCell || isSelectCell) return;
                        onClick?.(row.original);
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, {
                        ...cell.getContext(),
                        hasSelection,
                      })}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          : <TableRow>
              <TableCell colSpan={columns.length}>No results.</TableCell>
            </TableRow>
          }
        </TableBody>
      </Table>
    </div>
  );
};
