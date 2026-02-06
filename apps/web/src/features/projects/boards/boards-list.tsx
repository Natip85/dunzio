"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LayoutGrid } from "lucide-react";
import { toast } from "sonner";

import { BoardsListSkeleton } from "@/features/loaders";
import { useTRPC } from "@/trpc";
import { BoardCard } from "./board-card";
import { DeleteBoardDialog } from "./delete-board-dialog";
import { EditBoardDialog } from "./edit-board-dialog";

type BoardsListProps = {
  projectId: string;
};

export function BoardsList({ projectId }: BoardsListProps) {
  const [editBoardId, setEditBoardId] = useState<string | null>(null);
  const [deleteBoardId, setDeleteBoardId] = useState<string | null>(null);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: boards, isLoading } = useQuery(trpc.project.listBoards.queryOptions({ projectId }));

  const { mutate: deleteMutation, isPending } = useMutation(
    trpc.project.deleteBoard.mutationOptions({
      onSuccess: () => {
        toast.success("Board deleted");
        void queryClient.invalidateQueries({
          queryKey: trpc.project.listBoards.queryKey({ projectId }),
        });
        setDeleteBoardId(null);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete board");
      },
    })
  );

  const boardToEdit = boards?.find((b) => b.id === editBoardId);
  const boardToDelete = boards?.find((b) => b.id === deleteBoardId);

  if (isLoading) {
    return <BoardsListSkeleton />;
  }

  if (!boards || boards.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {boards.map((board) => (
          <BoardCard
            key={board.id}
            board={board}
            projectId={projectId}
            onEdit={setEditBoardId}
            onDelete={setDeleteBoardId}
          />
        ))}
      </div>

      {boardToEdit && (
        <EditBoardDialog
          board={boardToEdit}
          open={!!editBoardId}
          onOpenChange={(open) => !open && setEditBoardId(null)}
        />
      )}

      {boardToDelete && (
        <DeleteBoardDialog
          board={boardToDelete}
          open={!!deleteBoardId}
          onOpenChange={(open) => !open && setDeleteBoardId(null)}
          onConfirm={() => deleteMutation({ boardId: boardToDelete.id })}
          isDeleting={isPending}
        />
      )}
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-12">
      <div className="bg-muted flex size-16 items-center justify-center rounded-full">
        <LayoutGrid className="text-muted-foreground size-8" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold">No boards yet</h3>
        <p className="text-muted-foreground text-sm">
          Create your first board to start organizing tasks.
        </p>
      </div>
    </div>
  );
}
