import ProjectBoard from "@/features/projects/project-board";
import { api } from "@/trpc/server";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const project = await api.project.byId(+id);

  return (
    <div className="flex-1 overflow-y-auto p-2 md:p-5">
      <ProjectBoard project={project} />
    </div>
  );
}
