"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTRPC } from "@/trpc";

type DeleteColumnDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  column: {
    id: string;
    boardId: string;
    name: string;
    color: string;
  };
  taskCount: number;
  siblingColumns: { id: string; name: string; color: string }[];
};

export function DeleteColumnDialog({
  open,
  onOpenChange,
  column,
  taskCount,
  siblingColumns,
}: DeleteColumnDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [targetColumnId, setTargetColumnId] = useState<string>("");

  const hasTasks = taskCount > 0;
  const availableTargetColumns = siblingColumns.filter((c) => c.id !== column.id);

  const { mutate: deleteColumn, isPending } = useMutation(
    trpc.project.deleteColumn.mutationOptions({
      onSuccess: () => {
        // Invalidate board queries to refresh the UI (using tRPC query key structure)
        void queryClient.invalidateQueries({
          queryKey: [["project", "getBoard"]],
        });
        // Invalidate all task queries to ensure moved tasks appear in their new column
        // refetchType: "all" ensures even inactive queries are refetched
        void queryClient.invalidateQueries({
          queryKey: [["task", "getByColumn"]],
          refetchType: "all",
        });
        onOpenChange(false);
        setTargetColumnId("");
      },
    })
  );

  const handleDelete = () => {
    if (hasTasks && !targetColumnId) {
      return; // Don't allow delete without selecting a target column
    }

    deleteColumn({
      columnId: column.id,
      moveTasksToColumnId: hasTasks ? targetColumnId : undefined,
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isPending) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setTargetColumnId("");
      }
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="text-destructive h-5 w-5" />
            Delete column &quot;{column.name}&quot;?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {hasTasks ?
              `This column contains ${taskCount} task${taskCount > 1 ? "s" : ""}. You need to move them to another column before deleting.`
            : "This action cannot be undone. The column will be permanently deleted."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {hasTasks && availableTargetColumns.length > 0 && (
          <div className="space-y-2 py-2">
            <Label htmlFor="target-column">Move tasks to</Label>
            <Select
              value={targetColumnId}
              onValueChange={setTargetColumnId}
            >
              <SelectTrigger id="target-column">
                <SelectValue placeholder="Select a column" />
              </SelectTrigger>
              <SelectContent>
                {availableTargetColumns.map((col) => (
                  <SelectItem
                    key={col.id}
                    value={col.id}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: col.color }}
                      />
                      {col.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {hasTasks && availableTargetColumns.length === 0 && (
          <p className="text-destructive text-sm">
            Cannot delete this column. There are no other columns to move the tasks to.
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={
              isPending || (hasTasks && (!targetColumnId || availableTargetColumns.length === 0))
            }
            onClick={handleDelete}
          >
            {isPending ?
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            : "Delete column"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
