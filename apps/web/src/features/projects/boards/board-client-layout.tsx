"use client";

import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";

import { Tabs } from "@/components/ui/tabs";

type BoardClientLayoutProps = {
  children: React.ReactNode;
  projectId: string;
  boardId: string;
};

export function BoardClientLayout({ children, projectId, boardId }: BoardClientLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const currentView = pathname.includes("/summary") ? "summary" : "kanban";

  const handleTabChange = (value: string) => {
    const basePath = `/projects/${projectId}/boards/${boardId}`;
    if (value === "kanban") {
      router.push(basePath as Route, { scroll: false });
    } else {
      router.push(`${basePath}/${value}` as Route, { scroll: false });
    }
  };

  return (
    <Tabs
      className="min-h-0 w-full flex-1"
      value={currentView}
      onValueChange={handleTabChange}
    >
      {children}
    </Tabs>
  );
}
