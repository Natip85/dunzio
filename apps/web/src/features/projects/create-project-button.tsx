"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddProjectForm } from "./add-project-form";

export function CreateProjectButton() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = (projectId: string) => {
    setIsOpen(false);
    // Navigate to the new project
    if (projectId) {
      router.push(`/projects/${projectId}`);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Create a new project with a customizable board for tracking work.
          </DialogDescription>
        </DialogHeader>
        <AddProjectForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
