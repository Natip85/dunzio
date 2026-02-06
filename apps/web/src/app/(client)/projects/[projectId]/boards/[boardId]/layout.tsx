import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";

import { db } from "@dunzio/db";
import { board } from "@dunzio/db/schema/projects";

import { BoardClientLayout } from "@/features/projects/boards/board-client-layout";
import { requireActiveOrganizationId } from "@/lib/auth-server";

type BoardLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ projectId: string; boardId: string }>;
};

export default async function BoardLayout({ children, params }: BoardLayoutProps) {
  const { projectId, boardId } = await params;
  const activeOrgId = await requireActiveOrganizationId();

  const boardData = await db.query.board.findFirst({
    where: and(eq(board.id, boardId), eq(board.projectId, projectId)),
    with: { project: true },
  });

  if (boardData?.project?.organizationId !== activeOrgId) {
    notFound();
  }

  return (
    <BoardClientLayout
      projectId={projectId}
      boardId={boardId}
    >
      {children}
    </BoardClientLayout>
  );
}
