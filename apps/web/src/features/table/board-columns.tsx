"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type { RouterOutputs } from "@dunzio/api";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { priorityColors, typeIcons } from "@/features/projects/kanban/task-card";
import { TaskCardGitHubBadge } from "../github/task-card-github-badge";
import { BoardTableListActions } from "./board-table-list-actions";

// import { AssetsRowActions } from "./assets-row-actions";

export type BoardIssue = RouterOutputs["task"]["getByColumn"][number];

export const columns: ColumnDef<BoardIssue>[] = [
  {
    id: "select",
    size: 40,
    maxSize: 40,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllRowsSelected() ? true
          : table.getIsSomeRowsSelected() ?
            "indeterminate"
          : false
        }
        onCheckedChange={(checked) => {
          table.getToggleAllRowsSelectedHandler()({
            target: { checked: checked === true },
          } as React.ChangeEvent<HTMLInputElement>);
        }}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={
          row.getIsSelected() ? true
          : row.getIsSomeSelected() ?
            "indeterminate"
          : false
        }
        disabled={!row.getCanSelect()}
        onCheckedChange={(checked) => {
          row.getToggleSelectedHandler()({
            target: { checked: checked === true },
          } as React.ChangeEvent<HTMLInputElement>);
        }}
      />
    ),
  },
  {
    id: "id",
    accessorKey: "id",
    header: () => <div>ID</div>,
    cell: ({ row }) => <div>{row.original.id}</div>,
  },
  {
    id: "title",
    accessorKey: "title",
    header: () => <div>Title</div>,
    cell: ({ row }) => <div className="max-w-[300px] truncate">{row.original.title}</div>,
  },
  {
    id: "key",
    accessorKey: "key",
    header: () => <div>Key</div>,
    cell: ({ row }) => <div>{row.original.key}</div>,
  },
  {
    id: "priority",
    accessorKey: "priority",
    header: () => <div>Priority</div>,
    cell: ({ row }) => (
      <Badge className={priorityColors[row.original.priority]}>{row.original.priority}</Badge>
    ),
  },
  {
    id: "assignee",
    accessorKey: "assignee",
    header: () => <div>Assignee</div>,
    cell: ({ row }) => (
      <Avatar>
        {row.original.assignee ?
          <>
            <AvatarImage src={row.original.assignee.image ?? undefined} />
            <AvatarFallback className="text-xs">
              {row.original.assignee.name?.charAt(0) ?? ""}
            </AvatarFallback>
          </>
        : <AvatarFallback className="bg-muted text-muted-foreground text-xs"> </AvatarFallback>}
      </Avatar>
    ),
  },
  {
    id: "type",
    accessorKey: "type",
    header: () => <div>Type</div>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="text-xs">{typeIcons[row.original.type]}</span> {row.original.type}
      </div>
    ),
  },
  {
    id: "github",
    accessorKey: "github",
    header: () => <div>GitHub</div>,
    cell: ({ row }) => <TaskCardGitHubBadge issueId={row.original.id} />,
  },
  {
    id: "actions",
    accessorKey: "actions",
    header: () => <div></div>,
    cell: ({ row }) => <BoardTableListActions row={row} />,
    size: 40,
    maxSize: 40,
  },
];
