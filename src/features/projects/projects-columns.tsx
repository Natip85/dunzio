"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { ProjectsRowActions } from "./projects-row-actions";
import { Button } from "@/components/ui/button";
import type { ProjectSelect } from "./project-types";
import Link from "next/link";

export const columns: ColumnDef<ProjectSelect>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div>
        <Link
          href={`/projects/${row.original.id}`}
          className="hover:text-sky-600"
        >
          {row.original.name ?? ""}
        </Link>
      </div>
    ),
  },
  {
    accessorKey: "actions",
    header: () => (
      <div className="flex w-full justify-end">
        <Button variant={"ghost"} title="Actions">
          Actions
        </Button>
      </div>
    ),
    cell: ({ row }) => <ProjectsRowActions row={row} />,
  },
];
