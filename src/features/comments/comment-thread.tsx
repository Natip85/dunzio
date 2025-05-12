import { api } from "@/trpc/react";
import type { Project } from "../projects/project-types";
import CommentCard from "../tasks/comment-card";

interface Props {
  task: Project["cols"][number]["colTasks"][number];
}

export default function CommentThread({ task }: Props) {
  const { data: comments } = api.comment.getAllByTask.useQuery(task.id);
  return (
    <div className="flex flex-col gap-3">
      {comments?.map((item) => (
        <CommentCard
          key={item.id}
          createdAt={item.createdAt}
          name={item.user.name}
          text={item.content}
          image={item.user.image}
        />
      ))}
    </div>
  );
}
