import { buttonVariants } from "@/components/ui/button";
import SettingsClient from "@/features/projects/settings-client";
import { api } from "@/trpc/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SettingsPage({ params }: Props) {
  const project = await api.project.byId(parseInt((await params).id));
  return (
    <div className="flex-1 p-2 md:p-5">
      <div>
        <Link href={"."} className={buttonVariants({ variant: "ghost" })}>
          <ArrowLeft />
        </Link>
      </div>
      <div>
        <SettingsClient project={project} />
      </div>
    </div>
  );
}
