import { eq } from "drizzle-orm";
import { FolderKanban } from "lucide-react";

import { db } from "@dunzio/db";
import { project } from "@dunzio/db/schema/projects";

import { PageTitle } from "@/components/page-title";
import { CreateProjectButton } from "@/features/projects/create-project-button";
import { ProjectsList } from "@/features/projects/projects-list";
import { requireActiveOrganizationId } from "@/lib/auth-server";

export default async function ProjectsPage() {
  const activeOrgId = await requireActiveOrganizationId();

  const projects = await db.query.project.findMany({
    where: eq(project.organizationId, activeOrgId),
    orderBy: (project, { desc }) => [desc(project.updatedAt)],
  });

  return (
    <div className="flex flex-1 flex-col gap-6 py-6 pr-4.5 pl-6">
      <PageTitle title="Projects">
        <CreateProjectButton />
      </PageTitle>

      {projects.length === 0 ?
        <EmptyState />
      : <ProjectsList projects={projects} />}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-12">
      <div className="bg-muted flex size-16 items-center justify-center rounded-full">
        <FolderKanban className="text-muted-foreground size-8" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold">No projects yet</h3>
        <p className="text-muted-foreground text-sm">
          Create your first project to start tracking work.
        </p>
      </div>
      <CreateProjectButton />
    </div>
  );
}
