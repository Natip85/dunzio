"use client";

import type { JSONContent } from "@tiptap/react";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { UserOption } from "../components/user-select";
import type { CreateTaskFormValues } from "./schemas";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { UserSelect } from "../components/user-select";
import { TaskRichTextEditor } from "./editor/task-rich-text-editor";
import {
  extractPlainTextFromTiptap,
  isEmptyTiptapDoc,
  tiptapDocFromPlainText,
} from "./editor/tiptap-utils";
import { createTaskFormSchema } from "./schemas";

type BoardColumn = {
  id: string;
  name: string;
};

type AddTaskFormProps = {
  projectId: string;
  columns: BoardColumn[];
  users: UserOption[];
  defaultColumnId?: string;
  onSuccess?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
};

const ISSUE_TYPES = [
  { value: "task", label: "Task" },
  { value: "bug", label: "Bug" },
  { value: "story", label: "Story" },
  { value: "epic", label: "Epic" },
  { value: "subtask", label: "Subtask" },
] as const;

const PRIORITIES = [
  { value: "lowest", label: "Lowest" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "highest", label: "Highest" },
] as const;

export function AddTaskForm({
  projectId,
  columns,
  users,
  defaultColumnId,
  onSuccess,
  onDirtyChange,
}: AddTaskFormProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskFormSchema),
    defaultValues: {
      title: "",
      content: tiptapDocFromPlainText(""),
      type: "task",
      priority: "medium",
      columnId: defaultColumnId,
      storyPoints: undefined,
      assigneeId: undefined,
    },
  });

  const { isDirty } = form.formState;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const createTaskMutation = useMutation(
    trpc.task.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Task ${data?.key} created`);
        // Invalidate queries to refetch tasks
        void queryClient.invalidateQueries({ queryKey: [["task", "getByColumn"]] });
        form.reset();
        onSuccess?.();
      },
      onError: (error) => {
        const message = error instanceof Error ? error.message : "Failed to create task";
        toast.error(message);
      },
    })
  );

  const handleSubmit = (values: CreateTaskFormValues) => {
    const contentDoc = values.content as JSONContent | null | undefined;
    const normalizedContent = isEmptyTiptapDoc(contentDoc) ? null : contentDoc;
    const description = extractPlainTextFromTiptap(normalizedContent);

    createTaskMutation.mutate({
      projectId,
      title: values.title,
      description: description || undefined,
      content: normalizedContent ?? undefined,
      type: values.type,
      priority: values.priority,
      columnId: values.columnId,
      storyPoints: values.storyPoints,
      assigneeId: values.assigneeId,
    });
  };

  const isSubmitting = createTaskMutation.isPending;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
      >
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter task title"
                  autoFocus
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description (Rich Text) */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <TaskRichTextEditor
                  value={field.value as JSONContent | null | undefined}
                  onChange={(doc) => field.onChange(doc)}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Type & Priority Row */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ISSUE_TYPES.map((type) => (
                      <SelectItem
                        key={type.value}
                        value={type.value}
                      >
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PRIORITIES.map((priority) => (
                      <SelectItem
                        key={priority.value}
                        value={priority.value}
                      >
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Column & Assignee Row */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="columnId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {columns.map((column) => (
                      <SelectItem
                        key={column.id}
                        value={column.id}
                      >
                        {column.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assigneeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assignee</FormLabel>
                <FormControl>
                  <UserSelect
                    users={users}
                    value={field.value ?? undefined}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Story Points */}
        <FormField
          control={form.control}
          name="storyPoints"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Story Points</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  min={0}
                  max={100}
                  disabled={isSubmitting}
                  className="w-24"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === "" ? undefined : parseInt(value, 10));
                  }}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
