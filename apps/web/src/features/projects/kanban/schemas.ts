import { z } from "zod";

import type { IssuePriority, IssueType } from "@dunzio/db/validators";
import {
  createIssueSchema,
  issuePrioritySchema,
  issueTypeSchema,
  updateIssueSchema,
} from "@dunzio/db/validators";

// Re-export shared validators
export { createIssueSchema, issuePrioritySchema, issueTypeSchema, updateIssueSchema };
export type { IssuePriority, IssueType };

// Form schema omits projectId since it's passed as a prop
export const createTaskFormSchema = createIssueSchema.omit({ projectId: true });
// Use z.input for form values since .default() makes output types required but input types optional
export type CreateTaskFormValues = z.input<typeof createTaskFormSchema>;

// Edit form schema omits id since it's passed separately
export const editTaskFormSchema = updateIssueSchema.omit({ id: true });
export type EditTaskFormValues = z.input<typeof editTaskFormSchema>;

// Column category enum
export const columnCategorySchema = z.enum(["todo", "in_progress", "done"]);
export type ColumnCategory = z.infer<typeof columnCategorySchema>;

// Schema for creating a new column
export const createColumnSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  description: z.string().max(200, "Description is too long").optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
    .default("#6B7280"),
  category: columnCategorySchema.default("todo"),
});

export type CreateColumnFormValues = z.input<typeof createColumnSchema>;

// Schema for editing an existing column (same fields, used for form validation)
export const updateColumnSchema = createColumnSchema;
export type UpdateColumnFormValues = z.input<typeof updateColumnSchema>;
