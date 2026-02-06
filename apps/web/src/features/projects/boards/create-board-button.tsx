"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CreateBoardDialog } from "./create-board-dialog";

type CreateBoardButtonProps = {
  projectId: string;
};

export function CreateBoardButton({ projectId }: CreateBoardButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="mr-2 size-4" />
        New Board
      </Button>
      <CreateBoardDialog
        projectId={projectId}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  );
}
