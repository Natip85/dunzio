"use client";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { type Project } from "./project-types";
import EditProjectForm from "./edit-project-form";
import { useQueryState } from "nuqs";

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
    setTab(value as "project" | "access");
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

function ManageAccess() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl tracking-tight">Who has access</h2>
        <p className="text-muted-foreground">
          Control who has access to your project and what permissions they have.
        </p>
      </div>
      <Separator />
      <div className="space-y-4">
        <div className="grid gap-2">
          <h3 className="text-lg font-medium">Team Members</h3>
          <div className="rounded-md border">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-muted h-10 w-10 rounded-full"></div>
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-muted-foreground text-sm">
                      john@example.com
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Admin</p>
                </div>
              </div>
            </div>
            <Separator />
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-muted h-10 w-10 rounded-full"></div>
                  <div>
                    <p className="font-medium">Jane Smith</p>
                    <p className="text-muted-foreground text-sm">
                      jane@example.com
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Editor</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-2">
          <h3 className="text-lg font-medium">Invite New Members</h3>
          <div className="flex gap-2">
            <Input className="flex-1" placeholder="Email address" />
            <Button>Invite</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
