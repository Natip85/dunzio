"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, FolderKanban, GithubIcon, Kanban, ShieldBan } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { NavMainSkeleton } from "@/features/loaders";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/trpc";

export function NavMain() {
  const trpc = useTRPC();
  const pathname = usePathname();

  const { data: projects, isLoading } = useQuery(
    trpc.project.listProjectsWithBoards.queryOptions()
  );

  const { data: session } = authClient.useSession();
  const isAdmin = session?.user?.role === "admin";

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        <Link
          href={"/projects" as Route}
          className="hover:text-sidebar-foreground transition-colors"
        >
          Projects
        </Link>
      </SidebarGroupLabel>
      <SidebarMenu>
        {isLoading ?
          <NavMainSkeleton />
        : !projects || projects.length === 0 ?
          <div className="text-muted-foreground px-2 py-4 text-center text-xs">
            No projects yet.{" "}
            <Link
              href={"/projects" as Route}
              className="text-sidebar-foreground underline underline-offset-2"
            >
              Create one
            </Link>
          </div>
        : projects.map((proj) => {
            const projectUrl = `/projects/${proj.id}`;
            const isProjectActive =
              pathname === projectUrl || pathname.startsWith(projectUrl + "/");

            return (
              <Collapsible
                key={proj.id}
                asChild
                defaultOpen={isProjectActive}
              >
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isProjectActive}
                    tooltip={proj.name}
                  >
                    <Link href={projectUrl as Route}>
                      <FolderKanban className="size-4" />
                      <span>{proj.name}</span>
                    </Link>
                  </SidebarMenuButton>
                  {proj.boards.length > 0 && (
                    <>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuAction className="data-[state=open]:rotate-90">
                          <ChevronRight />
                          <span className="sr-only">Toggle boards</span>
                        </SidebarMenuAction>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          <SidebarMenuSubItem>
                            <span className="text-muted-foreground px-2 py-1 text-xs font-medium">
                              Boards
                            </span>
                          </SidebarMenuSubItem>
                          {proj.boards.map((b) => {
                            const boardUrl = `/projects/${proj.id}/boards/${b.id}`;
                            const isBoardActive =
                              pathname === boardUrl || pathname.startsWith(boardUrl + "/");

                            return (
                              <SidebarMenuSubItem key={b.id}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isBoardActive}
                                >
                                  <Link href={boardUrl as Route}>
                                    <Kanban className="size-3.5" />
                                    <span>{b.name}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </>
                  )}
                </SidebarMenuItem>
              </Collapsible>
            );
          })
        }
        <SidebarGroupLabel>Settings</SidebarGroupLabel>
        <SidebarMenuItem key="integrations">
          <SidebarMenuButton
            asChild
            isActive={pathname === "/settings/integrations"}
            tooltip="Integrations"
          >
            <Link href={"/settings/integrations" as Route}>
              <GithubIcon className="size-4" />
              <span>Integrations</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        {isAdmin && (
          <>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarMenuItem key="admin">
              <SidebarMenuButton
                asChild
                isActive={pathname === "/admin"}
                tooltip="Admin"
              >
                <Link href="#">
                  <ShieldBan className="size-4" />
                  <span>Admin</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
