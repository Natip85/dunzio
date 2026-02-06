import { z } from "zod";

// Column category enum values (matching the DB column category)
export const columnCategorySchema = z.enum(["todo", "in_progress", "done"]);
export type ColumnCategory = z.infer<typeof columnCategorySchema>;

// Schema for a board column input
export const columnSchema = z.object({
  id: z.string().optional(), // Optional for new columns
  name: z.string().min(1, "Column name is required").max(50, "Column name is too long"),
  category: columnCategorySchema,
  color: z.string().optional(),
});

export type ColumnInput = z.infer<typeof columnSchema>;

// Schema for creating a project with a board
export const createProjectWithBoardSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100, "Project name is too long"),
  columns: z
    .array(columnSchema)
    .min(1, "At least one column is required")
    .max(20, "Maximum 20 columns allowed"),
});

export type CreateProjectWithBoardInput = z.infer<typeof createProjectWithBoardSchema>;

// Schema for updating a project
export const updateProjectSchema = z.object({
  projectId: z.string(),
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name is too long")
    .optional(),
  description: z.string().max(500, "Description is too long").nullable().optional(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

// Schema for deleting a project
export const deleteProjectSchema = z.object({
  projectId: z.string(),
});

export type DeleteProjectInput = z.infer<typeof deleteProjectSchema>;

// Default columns for new projects
export const DEFAULT_PROJECT_COLUMNS: ColumnInput[] = [
  { name: "To Do", category: "todo" },
  { name: "In Progress", category: "in_progress" },
  { name: "In Review", category: "in_progress" },
  { name: "Done", category: "done" },
];
