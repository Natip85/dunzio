"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { CreateColumnFormValues } from "./schemas";
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
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/trpc";
import { createColumnSchema } from "./schemas";

type AddColumnFormProps = {
  boardId: string;
  onSuccess?: () => void;
  /** When provided, the form operates in edit mode and calls updateColumn instead of createColumn. */
  columnId?: string;
  /** Initial values to populate the form (used in edit mode). */
  initialValues?: {
    name: string;
    description?: string | null;
    color: string;
    category: string;
  };
};

const CATEGORIES = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
] as const;

const PRESET_COLORS = [
  { value: "#6B7280", label: "Gray" },
  { value: "#EF4444", label: "Red" },
  { value: "#F97316", label: "Orange" },
  { value: "#EAB308", label: "Yellow" },
  { value: "#22C55E", label: "Green" },
  { value: "#14B8A6", label: "Teal" },
  { value: "#3B82F6", label: "Blue" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#EC4899", label: "Pink" },
] as const;

export function AddColumnForm({ boardId, onSuccess, columnId, initialValues }: AddColumnFormProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const isEditMode = !!columnId;

  const form = useForm<CreateColumnFormValues>({
    resolver: zodResolver(createColumnSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      color: initialValues?.color ?? "#6B7280",
      category: (initialValues?.category as CreateColumnFormValues["category"]) ?? "todo",
    },
  });

  const createColumnMutation = useMutation(
    trpc.project.createColumn.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Column "${data.name}" created`);
        void queryClient.invalidateQueries({
          queryKey: [["project", "getBoard"]],
        });
        form.reset();
        onSuccess?.();
      },
      onError: (error) => {
        const message = error instanceof Error ? error.message : "Failed to create column";
        toast.error(message);
      },
    })
  );

  const updateColumnMutation = useMutation(
    trpc.project.updateColumn.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Column "${data.name}" updated`);
        void queryClient.invalidateQueries({
          queryKey: [["project", "getBoard"]],
        });
        onSuccess?.();
      },
      onError: (error) => {
        const message = error instanceof Error ? error.message : "Failed to update column";
        toast.error(message);
      },
    })
  );

  const handleSubmit = (values: CreateColumnFormValues) => {
    if (isEditMode) {
      updateColumnMutation.mutate({
        columnId,
        name: values.name,
        description: values.description,
        color: values.color,
        category: values.category,
      });
    } else {
      createColumnMutation.mutate({
        boardId,
        name: values.name,
        description: values.description,
        color: values.color,
        category: values.category,
      });
    }
  };

  const isSubmitting = isEditMode ? updateColumnMutation.isPending : createColumnMutation.isPending;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
      >
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter column name"
                  autoFocus
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add a description..."
                  className="min-h-16 resize-none"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category & Color Row */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem
                        key={category.value}
                        value={category.value}
                      >
                        {category.label}
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
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select color">
                        {field.value && (
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: field.value }}
                            />
                            {PRESET_COLORS.find((c) => c.value === field.value)?.label ?? "Custom"}
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PRESET_COLORS.map((color) => (
                      <SelectItem
                        key={color.value}
                        value={color.value}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: color.value }}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isEditMode ?
              isSubmitting ?
                "Saving..."
              : "Save Changes"
            : isSubmitting ?
              "Creating..."
            : "Create Column"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
