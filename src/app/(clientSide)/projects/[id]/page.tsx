import ProjectBoardClientWrapper from "@/features/projects/project-board-wrapper";
import { api } from "@/trpc/server";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, SettingsIcon } from "lucide-react";
import Link from "next/link";
type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const project = await api.project.byId(+id);

  return (
    <div className="flex-1 overflow-y-auto p-2 md:p-5">
      <div className="mb-10 flex items-center justify-between px-10">
        <h2 className="text-2xl font-semibold md:text-4xl">{project.name}</h2>
        <div>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button size={"sm"} variant="ghost">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href={`/projects/${project.id}/settings`}>
                    <SettingsIcon /> Settings
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div>
        <ProjectBoardClientWrapper project={project} />
      </div>
    </div>
  );
}
