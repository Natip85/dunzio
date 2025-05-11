"use client";
"use no memo";

import type { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="mt-5 flex items-center justify-end gap-5">
      <div className="flex items-center gap-2">
        <Label className="text-xs">Rows per page</Label>
        <Select
          defaultValue={String(table.getState().pagination.pageSize)}
          // onValueChange={async (value) => {
          // table.setPageSize(Number(value))
          // await setSearchParams({perPage: Number(value), page: 1})
          // }}
        >
          <SelectTrigger className="h-9 w-fit px-3">
            <SelectValue
              placeholder={String(table.getState().pagination.pageSize)}
            />
          </SelectTrigger>

          <SelectContent>
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <SelectItem key={pageSize} value={String(pageSize)}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          // onClick={async () => {
          // table.previousPage()
          // await setSearchParams({ page: page - 1 });
          // }}
          // disabled={!table.getCanPreviousPage()}
          // disabled={page < 2}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          // onClick={async () => {
          //   table.nextPage()
          //   await setSearchParams({ page: page + 1 });
          // }}
          // disabled={!table.getCanNextPage()}
          disabled={!table.getRowCount()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
