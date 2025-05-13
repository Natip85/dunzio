"use client";
"use no memo";

import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  projectSelectSchema,
  type Project,
  type ProjectSelect,
} from "./project-types";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  project: Project;
}
export default function EditProjectForm({ project }: Props) {
  const router = useRouter();

  const { mutateAsync: updateProject, isPending: isLoading } =
    api.project.update.useMutation({
      onSuccess: () => {
        router.refresh();
      },
    });

  const { mutateAsync: deleteProject, isPending: isDeleteLoading } =
    api.project.delete.useMutation({
      onSuccess: () => {
        router.refresh();
        router.push("/projects");
      },
    });

  const form = useForm<ProjectSelect>({
    resolver: zodResolver(projectSelectSchema),
    defaultValues: project,
  });

  const onSubmit = async (values: ProjectSelect) => {
    await updateProject(values);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Project Settings</h2>
      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name *</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end pt-2">
            <Button disabled={isLoading} type="submit">
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>

      <Separator />

      <div className="grid gap-2">
        <h3 className="text-lg font-medium">Danger zone</h3>
        <div className="bg-destructive/20 grid gap-4 rounded-md p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Project</p>
              <p className="text-muted-foreground text-sm">
                Permanently delete this project and all of its data.
              </p>
            </div>
            <Button
              variant="destructive"
              disabled={isDeleteLoading}
              onClick={async () => await deleteProject(project.id)}
            >
              Delete Project
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
