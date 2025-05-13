"use client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users } from "lucide-react";

import { type Project } from "./project-types";
import EditProjectForm from "./edit-project-form";
import { useQueryState } from "nuqs";
import ManageAccess from "./manage-access";

interface Props {
  project: Project;
}

export default function SettingsClient({ project }: Props) {
  const [tab, setTab] = useQueryState("tab", {
    defaultValue: "project",
    parse: (value) => {
      // Only allow valid tab values
      return ["project", "access"].includes(value) ? value : "project";
    },
  });
  const handleTabChange = (value: string) => {
    void setTab(value as "project" | "access");
  };
  return (
    <Tabs
      value={tab}
      onValueChange={handleTabChange}
      className="flex flex-col gap-6 md:flex-row"
    >
      {/* Side Menu */}
      <div className="w-full shrink-0 md:w-64">
        <Card className="p-2">
          <TabsList className="flex h-auto w-full flex-col items-stretch gap-1 bg-transparent p-0">
            <TabsTrigger
              value="project"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center justify-start px-3 py-2"
            >
              <Settings className="mr-2 h-4 w-4" />
              Project Settings
            </TabsTrigger>
            <TabsTrigger
              value="access"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center justify-start px-3 py-2"
            >
              <Users className="mr-2 h-4 w-4" />
              Manage Access
            </TabsTrigger>
          </TabsList>
        </Card>
      </div>
      {/* Content Area */}
      <div className="flex-1">
        <Card className="p-6">
          <TabsContent value="project" className="m-0">
            <EditProjectForm project={project} />
          </TabsContent>
          <TabsContent value="access" className="m-0">
            <ManageAccess />
          </TabsContent>
        </Card>
      </div>
    </Tabs>
  );
}
