"use client";

import { LayoutGrid, MoreVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContentLink,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type BoardCardProps = {
  board: {
    id: string;
    name: string;
    description?: string | null;
    isDefault: boolean;
    columns: { id: string; name: string }[];
    createdAt: Date;
  };
  projectId: string;
  onEdit?: (boardId: string) => void;
  onDelete?: (boardId: string) => void;
};

export function BoardCard({ board, projectId, onEdit, onDelete }: BoardCardProps) {
  return (
    <Card className="hover:bg-muted/50 group relative cursor-pointer rounded-md p-0 transition-colors">
      <CardContentLink
        className="pt-4 pb-4"
        href={`/projects/${projectId}/boards/${board.id}`}
      >
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
              <LayoutGrid className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="flex items-center gap-2 truncate">
                {board.name}
                {board.isDefault && (
                  <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs font-normal">
                    Default
                  </span>
                )}
              </CardTitle>
              <CardDescription className="truncate">
                {board.columns.length} column{board.columns.length !== 1 ? "s" : ""}
                {board.description && ` · ${board.description}`}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-3 right-3 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => e.preventDefault()}
              >
                <MoreVertical className="size-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(board.id);
                }}
              >
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(board.id);
                }}
                disabled={board.isDefault}
              >
                Delete board
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
      </CardContentLink>
    </Card>
  );
}
