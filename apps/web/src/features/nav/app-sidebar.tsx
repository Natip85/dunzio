"use client";

import * as React from "react";
import { ChevronsLeft, ChevronsRight, Menu } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsPage } from "@/hooks/is-page";
import { cn } from "@/lib/utils";
import { NavMain } from "./nav-main";
import { OrgSwitcher } from "./org-switcher";

function CustomSidebarTrigger() {
  const { state } = useSidebar();
  return (
    <SidebarTrigger
      className={cn(
        "bg-background text-foreground hover:bg-sidebar hover:text-sidebar-foreground absolute top-14 -right-4 z-50 rounded-full border-0 transition-all duration-300 ease-in-out",
        "[&_svg]:transition-all [&_svg]:duration-300 [&_svg]:ease-in-out active:[&_svg]:scale-125",
        state === "collapsed" ? "cursor-e-resize" : "cursor-w-resize"
      )}
      variant="ghost"
      size="icon"
    >
      {state === "collapsed" ?
        <ChevronsRight />
      : <ChevronsLeft />}
    </SidebarTrigger>
  );
}

function MobileSidebarTrigger() {
  return (
    <SidebarTrigger
      className="hover:bg-accent fixed top-4 left-2 z-50 md:hidden"
      variant="ghost"
      size="icon"
    >
      <Menu className="h-5 w-5" />
    </SidebarTrigger>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const isHome = useIsPage("/", true);
  if (isHome) {
    return null;
  }
  return (
    <>
      <MobileSidebarTrigger />
      <Sidebar
        className="pt-4"
        collapsible="icon"
        {...props}
      >
        <CustomSidebarTrigger />
        <SidebarHeader className="mb-8">
          <OrgSwitcher />
        </SidebarHeader>
        <SidebarContent>
          <NavMain />
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </>
  );
}
