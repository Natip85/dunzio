"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteColumnDialog } from "./delete-column-dialog";
import { EditColumnDialog } from "./edit-column-dialog";

type BoardColumn = {
  id: string;
  boardId: string;
  name: string;
  description: string | null;
  color: string;
  category: string;
};

type ColumnHeaderProps = {
  column: BoardColumn;
  count: number;
  siblingColumns: { id: string; name: string; color: string }[];
};

export function ColumnHeader({ column, count, siblingColumns }: ColumnHeaderProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  return (
    <>
      <div className="flex flex-1 items-center gap-2">
        {/* Color indicator */}
        <div
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: column.color }}
          aria-hidden="true"
        />

        {/* Column name */}
        <span className="truncate text-sm font-medium">{column.name}</span>

        {/* Issue count badge - now next to the name */}
        <Badge
          variant="secondary"
          className="h-5 shrink-0 rounded-full px-2 text-xs font-normal"
        >
          {count}
        </Badge>

        {/* Dropdown menu - now on the right */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground ml-auto h-6 w-6 shrink-0"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Column options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit column
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete column
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <EditColumnDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        column={column}
      />

      <DeleteColumnDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        column={column}
        taskCount={count}
        siblingColumns={siblingColumns}
      />
    </>
  );
}
