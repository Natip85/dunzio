import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { ChevronLeft } from "lucide-react";

import { db } from "@dunzio/db";
import { project } from "@dunzio/db/schema/projects";

import { PageTitle } from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { BoardsList } from "@/features/projects/boards/boards-list";
import { CreateBoardButton } from "@/features/projects/boards/create-board-button";
import { requireActiveOrganizationId } from "@/lib/auth-server";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectBoardsPage({ params }: PageProps) {
  const { projectId } = await params;
  const activeOrgId = await requireActiveOrganizationId();

  const projectData = await db.query.project.findFirst({
    where: and(eq(project.id, projectId), eq(project.organizationId, activeOrgId)),
  });

  if (!projectData) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-6 py-6 pr-4.5 pl-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          asChild
        >
          <Link href="/projects">
            <ChevronLeft className="size-4" />
            <span className="sr-only">Back to projects</span>
          </Link>
        </Button>
        <PageTitle
          title={projectData.name}
          className="w-full"
        >
          <CreateBoardButton projectId={projectId} />
        </PageTitle>
      </div>
      <BoardsList projectId={projectId} />
    </div>
  );
}
