"use client";

import type { JSONContent } from "@tiptap/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { UserOption } from "../components/user-select";
import type { EditTaskFormValues, IssuePriority, IssueType } from "./schemas";
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
import { UNASSIGNED_VALUE, UserSelect } from "../components/user-select";
import { TaskRichTextEditor } from "./editor/task-rich-text-editor";
import {
  extractPlainTextFromTiptap,
  isEmptyTiptapDoc,
  tiptapDocFromPlainText,
} from "./editor/tiptap-utils";
import { editTaskFormSchema } from "./schemas";

type BoardColumn = {
  id: string;
  name: string;
};

type TaskData = {
  id: string;
  key: string;
  title: string;
  description: string | null;
  content?: JSONContent | null;
  type: IssueType;
  priority: IssuePriority;
  columnId: string | null;
  storyPoints: number | null;
  assigneeId: string | null;
};

type EditTaskFormProps = {
  task: TaskData;
  columns: BoardColumn[];
  users: UserOption[];
  onSuccess?: () => void;
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

export function EditTaskForm({ task, columns, users, onSuccess }: EditTaskFormProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<EditTaskFormValues>({
    resolver: zodResolver(editTaskFormSchema),
    defaultValues: {
      title: task.title,
      content: task.content ?? tiptapDocFromPlainText(task.description),
      type: task.type,
      priority: task.priority,
      columnId: task.columnId ?? undefined,
      storyPoints: task.storyPoints ?? undefined,
      // Use UNASSIGNED_VALUE for null assigneeId so the select shows "Unassigned"
      assigneeId: task.assigneeId ?? UNASSIGNED_VALUE,
    },
  });

  const updateTaskMutation = useMutation(
    trpc.task.update.mutationOptions({
      onSuccess: () => {
        toast.success(`Task ${task.key} updated`);
        // Invalidate queries to refetch tasks
        void queryClient.invalidateQueries({ queryKey: [["task", "getByColumn"]] });
        void queryClient.invalidateQueries({ queryKey: [["task", "getById"]] });
        onSuccess?.();
      },
      onError: (error) => {
        const message = error instanceof Error ? error.message : "Failed to update task";
        toast.error(message);
      },
    })
  );

  const handleSubmit = (values: EditTaskFormValues) => {
    const contentDoc = values.content as JSONContent | null | undefined;
    const normalizedContent = isEmptyTiptapDoc(contentDoc) ? null : contentDoc;
    const description = extractPlainTextFromTiptap(normalizedContent);

    updateTaskMutation.mutate({
      id: task.id,
      title: values.title,
      description: description || null,
      content: normalizedContent,
      type: values.type,
      priority: values.priority,
      columnId: values.columnId,
      storyPoints: values.storyPoints,
      // Convert UNASSIGNED_VALUE to null so the API clears the assignee
      assigneeId: values.assigneeId === UNASSIGNED_VALUE ? null : values.assigneeId,
    });
  };

  const isSubmitting = updateTaskMutation.isPending;

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
                  onChange={(doc: JSONContent) => field.onChange(doc)}
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
                  value={field.value}
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
                  value={field.value}
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
                  value={field.value ?? undefined}
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
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
