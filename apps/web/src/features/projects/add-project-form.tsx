"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { motion } from "motion/react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import type { CreateProjectWithBoardInput } from "@dunzio/db/validators";
import { createProjectWithBoardSchema, DEFAULT_PROJECT_COLUMNS } from "@dunzio/db/validators";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTRPC } from "@/trpc";

type AddProjectFormProps = {
  onSuccess?: (projectId: string) => void;
};

export function AddProjectForm({ onSuccess }: AddProjectFormProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  const form = useForm<CreateProjectWithBoardInput>({
    resolver: zodResolver(createProjectWithBoardSchema),
    defaultValues: {
      name: "",
      columns: DEFAULT_PROJECT_COLUMNS,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "columns",
  });

  const { mutateAsync: createProject, isPending } = useMutation(
    trpc.project.createWithBoard.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Project "${data?.project?.name}" created`);
        // Invalidate project-related queries
        void queryClient.invalidateQueries({ queryKey: [["project"]] });
        router.refresh();
        form.reset();
        onSuccess?.(data?.project?.id ?? "");
      },
      onError: (error) => {
        const message = error instanceof Error ? error.message : "Failed to create project";
        toast.error(message);
      },
    })
  );

  const handleSubmit = async (values: CreateProjectWithBoardInput) => {
    await createProject({
      name: values.name.trim(),
      columns: values.columns.map((col) => ({
        name: col.name.trim(),
        category: col.category,
      })),
    });
  };

  const addColumn = () => {
    append({ name: "", category: "todo" });
  };

  const columnsValue = form.watch("columns");
  const hasInvalidColumns = columnsValue.some((c) => !c.name.trim());

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
      >
        {/* Project Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project name</FormLabel>
              <FormControl>
                <Input
                  placeholder="My Kanban Project"
                  autoFocus
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormDescription>Example: Team Astro, Visual upgrade, Bug tracking</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Columns Configuration */}
        <div className="space-y-3">
          <div>
            <FormLabel>Board columns</FormLabel>
            <p className="text-muted-foreground text-sm">
              Configure the columns for your project board.
            </p>
          </div>

          {/* Column headers */}
          <div className="flex items-center gap-2 px-1">
            <span className="text-muted-foreground flex-1 text-xs font-medium">Column name</span>
            <span className="text-muted-foreground w-[120px] text-xs font-medium">Column type</span>
            <div className="w-8" /> {/* Spacer for delete button */}
          </div>

          <div className="space-y-2">
            {fields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-2"
              >
                <FormField
                  control={form.control}
                  name={`columns.${index}.name`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder="e.g. Backlog, In Review, QA..."
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`columns.${index}.category`}
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="todo">Waiting</SelectItem>
                          <SelectItem value="in_progress">Active</SelectItem>
                          <SelectItem value="done">Finished</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => remove(index)}
                  disabled={fields.length <= 1 || isPending}
                  className="text-muted-foreground hover:text-destructive mt-1"
                >
                  <X className="size-4" />
                </Button>
              </motion.div>
            ))}
          </div>

          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start"
            onClick={addColumn}
            disabled={isPending}
          >
            <Plus className="mr-2 size-4" />
            Add column
          </Button>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="submit"
            disabled={isPending || fields.length === 0 || hasInvalidColumns}
          >
            {isPending ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
