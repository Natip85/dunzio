"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useTRPC } from "@/trpc";
import { DeleteProjectDialog } from "./delete-project-dialog";
import { EditProjectDialog } from "./edit-project-dialog";
import { ProjectCard } from "./project-card";

type Project = {
  id: string;
  name: string;
  key: string;
  updatedAt: Date;
};

type ProjectsListProps = {
  projects: Project[];
};

export function ProjectsList({ projects }: ProjectsListProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const deleteMutation = useMutation(
    trpc.project.deleteProject.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Project "${data.deletedProject?.name}" deleted`);
        void queryClient.invalidateQueries({ queryKey: [["project"]] });
        setDeletingProject(null);
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete project");
      },
    })
  );

  const handleEdit = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      setEditingProject(project);
    }
  };

  const handleDelete = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      setDeletingProject(project);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingProject) {
      deleteMutation.mutate({ projectId: deletingProject.id });
    }
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Edit Project Dialog */}
      {editingProject && (
        <EditProjectDialog
          project={editingProject}
          open={!!editingProject}
          onOpenChange={(open) => !open && setEditingProject(null)}
        />
      )}

      {/* Delete Project Dialog */}
      {deletingProject && (
        <DeleteProjectDialog
          project={deletingProject}
          open={!!deletingProject}
          onOpenChange={(open) => !open && setDeletingProject(null)}
          onConfirm={handleConfirmDelete}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </>
  );
}
