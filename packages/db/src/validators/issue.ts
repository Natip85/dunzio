import { z } from "zod";

// Issue type enum values (matching the DB enum)
export const issueTypeSchema = z.enum(["epic", "story", "task", "bug", "subtask"]);
export type IssueType = z.infer<typeof issueTypeSchema>;

// Issue priority enum values (matching the DB enum)
export const issuePrioritySchema = z.enum(["lowest", "low", "medium", "high", "highest"]);
export type IssuePriority = z.infer<typeof issuePrioritySchema>;

// Schema for creating a new task/issue
export const createIssueSchema = z.object({
  projectId: z.string(),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  content: z.unknown().optional(),
  type: issueTypeSchema.default("task"),
  priority: issuePrioritySchema.default("medium"),
  columnId: z.string().optional(),
  assigneeId: z.string().optional(),
  storyPoints: z.number().int().min(0).max(100).optional(),
  dueDate: z.date().optional(),
});

export type CreateIssueInput = z.infer<typeof createIssueSchema>;

// Schema for updating an existing task/issue
export const updateIssueSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required").max(200).optional(),
  description: z.string().nullable().optional(),
  content: z.unknown().nullable().optional(),
  type: issueTypeSchema.optional(),
  priority: issuePrioritySchema.optional(),
  columnId: z.string().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  storyPoints: z.number().int().min(0).max(100).nullable().optional(),
  dueDate: z.date().nullable().optional(),
});

export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;

// Recently updated time options
export const recentlyUpdatedSchema = z.enum(["1h", "24h", "7d", "30d"]);
export type RecentlyUpdated = z.infer<typeof recentlyUpdatedSchema>;

// Schema for filtering issues (used in task queries)
export const issueFilterSchema = z.object({
  q: z.string().optional(),
  assignees: z.array(z.string()).optional(),
  reporter: z.string().optional(),
  types: z.array(issueTypeSchema).optional(),
  priorities: z.array(issuePrioritySchema).optional(),
  sprint: z.string().optional(),
  epic: z.string().optional(),
  labels: z.array(z.string()).optional(),
  onlyMyIssues: z.boolean().optional(),
  recentlyUpdated: recentlyUpdatedSchema.optional(),
  hideDone: z.boolean().optional(),
  hideSubtasks: z.boolean().optional(),
});

export type IssueFilter = z.infer<typeof issueFilterSchema>;
