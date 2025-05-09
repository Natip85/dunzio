"use client";

import dynamic from "next/dynamic";
import type { Project } from "./project-types";

const ProjectBoard = dynamic(
  () => import("@/features/projects/project-board"),
  {
    ssr: false,
  },
);

export default function ProjectBoardClientWrapper({
  project,
}: {
  project: Project;
}) {
  return <ProjectBoard project={project} />;
}
