import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

export type JSONContent = {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: JSONContent[];
  marks?: {
    type: string;
    attrs?: Record<string, unknown>;
  }[];
  text?: string;
};

// ============================================================================
// ENUMS
// ============================================================================

export const issueTypeEnum = pgEnum("issue_type", ["epic", "story", "task", "bug", "subtask"]);

export const issuePriorityEnum = pgEnum("issue_priority", [
  "lowest",
  "low",
  "medium",
  "high",
  "highest",
]);

export const sprintStatusEnum = pgEnum("sprint_status", ["planned", "active", "completed"]);

// ============================================================================
// PROJECTS
// ============================================================================

/**
 * Projects belong to an organization (via Better Auth).
 * Each project has a unique key (e.g., "PROJ") used for issue keys like PROJ-123.
 */
export const project = pgTable(
  "project",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    organizationId: text("organization_id").notNull(), // References Better Auth organization
    name: text("name").notNull(),
    key: text("key").notNull(), // e.g., "PROJ" for issue keys like PROJ-123
    description: text("description"),
    iconUrl: text("icon_url"),
    leadId: text("lead_id").references(() => user.id, { onDelete: "set null" }),
    defaultAssigneeId: text("default_assignee_id").references(() => user.id, {
      onDelete: "set null",
    }),
    isArchived: boolean("is_archived").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    orgIdIdx: index("project_org_id_idx").on(table.organizationId),
    orgKeyUniqueIdx: uniqueIndex("project_org_key_unique_idx").on(table.organizationId, table.key),
  })
);

export const projectRelations = relations(project, ({ one, many }) => ({
  lead: one(user, {
    fields: [project.leadId],
    references: [user.id],
    relationName: "projectLead",
  }),
  defaultAssignee: one(user, {
    fields: [project.defaultAssigneeId],
    references: [user.id],
    relationName: "projectDefaultAssignee",
  }),
  boards: many(board),
  issues: many(issue),
  sprints: many(sprint),
  labels: many(label),
}));

// ============================================================================
// BOARDS (Kanban boards within a project)
// ============================================================================

export const board = pgTable(
  "board",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    isDefault: boolean("is_default").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    projectIdIdx: index("board_project_id_idx").on(table.projectId),
  })
);

export const boardRelations = relations(board, ({ one, many }) => ({
  project: one(project, {
    fields: [board.projectId],
    references: [project.id],
  }),
  columns: many(boardColumn),
}));

// ============================================================================
// BOARD COLUMNS (Status columns in a board)
// ============================================================================

export const boardColumn = pgTable(
  "board_column",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    boardId: text("board_id")
      .notNull()
      .references(() => board.id, { onDelete: "cascade" }),
    name: text("name").notNull(), // e.g., "To Do", "In Progress", "Done"
    description: text("description"),
    color: text("color").default("#6B7280").notNull(),
    position: integer("position").default(0).notNull(),
    // Category for workflow automation
    category: text("category").default("todo").notNull(), // "todo" | "in_progress" | "done"
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    boardIdIdx: index("board_column_board_id_idx").on(table.boardId),
    boardPositionIdx: index("board_column_position_idx").on(table.boardId, table.position),
  })
);

export const boardColumnRelations = relations(boardColumn, ({ one, many }) => ({
  board: one(board, {
    fields: [boardColumn.boardId],
    references: [board.id],
  }),
  issues: many(issue),
}));

// ============================================================================
// SPRINTS
// ============================================================================

export const sprint = pgTable(
  "sprint",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    goal: text("goal"),
    status: sprintStatusEnum("status").default("planned").notNull(),
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    projectIdIdx: index("sprint_project_id_idx").on(table.projectId),
    statusIdx: index("sprint_status_idx").on(table.status),
  })
);

export const sprintRelations = relations(sprint, ({ one, many }) => ({
  project: one(project, {
    fields: [sprint.projectId],
    references: [project.id],
  }),
  issues: many(issue),
}));

// ============================================================================
// LABELS
// ============================================================================

export const label = pgTable(
  "label",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color").default("#6B7280").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    projectIdIdx: index("label_project_id_idx").on(table.projectId),
    projectNameUniqueIdx: uniqueIndex("label_project_name_unique_idx").on(
      table.projectId,
      table.name
    ),
  })
);

export const labelRelations = relations(label, ({ one, many }) => ({
  project: one(project, {
    fields: [label.projectId],
    references: [project.id],
  }),
  issueLabels: many(issueLabel),
}));

// ============================================================================
// ISSUES (Main work items)
// ============================================================================

export const issue = pgTable(
  "issue",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    // Issue key like "PROJ-123" (auto-generated from project key + sequence)
    key: text("key").notNull(),
    number: integer("number").notNull(), // Sequential number within project
    title: text("title").notNull(),
    description: text("description"), // Rich text / markdown
    content: jsonb("content").$type<JSONContent>(), // TipTap JSON (rich text)
    type: issueTypeEnum("type").default("task").notNull(),
    priority: issuePriorityEnum("priority").default("medium").notNull(),

    // Status & Board
    columnId: text("column_id").references(() => boardColumn.id, {
      onDelete: "set null",
    }),
    position: integer("position").default(0).notNull(), // Position within column

    // Sprint
    sprintId: text("sprint_id").references(() => sprint.id, {
      onDelete: "set null",
    }),

    // Hierarchy (for epics/subtasks)
    parentId: text("parent_id"), // Self-referencing for subtasks

    // Assignments
    reporterId: text("reporter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    assigneeId: text("assignee_id").references(() => user.id, {
      onDelete: "set null",
    }),

    // Estimation
    storyPoints: integer("story_points"),
    originalEstimate: integer("original_estimate"), // in minutes
    timeSpent: integer("time_spent").default(0), // in minutes
    timeRemaining: integer("time_remaining"), // in minutes

    // Dates
    dueDate: timestamp("due_date"),
    resolvedAt: timestamp("resolved_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    projectIdIdx: index("issue_project_id_idx").on(table.projectId),
    keyUniqueIdx: uniqueIndex("issue_key_unique_idx").on(table.key),
    columnIdIdx: index("issue_column_id_idx").on(table.columnId),
    sprintIdIdx: index("issue_sprint_id_idx").on(table.sprintId),
    assigneeIdIdx: index("issue_assignee_id_idx").on(table.assigneeId),
    parentIdIdx: index("issue_parent_id_idx").on(table.parentId),
    typeIdx: index("issue_type_idx").on(table.type),
  })
);

export const issueRelations = relations(issue, ({ one, many }) => ({
  project: one(project, {
    fields: [issue.projectId],
    references: [project.id],
  }),
  column: one(boardColumn, {
    fields: [issue.columnId],
    references: [boardColumn.id],
  }),
  sprint: one(sprint, {
    fields: [issue.sprintId],
    references: [sprint.id],
  }),
  parent: one(issue, {
    fields: [issue.parentId],
    references: [issue.id],
    relationName: "issueHierarchy",
  }),
  children: many(issue, { relationName: "issueHierarchy" }),
  reporter: one(user, {
    fields: [issue.reporterId],
    references: [user.id],
    relationName: "issueReporter",
  }),
  assignee: one(user, {
    fields: [issue.assigneeId],
    references: [user.id],
    relationName: "issueAssignee",
  }),
  comments: many(comment),
  attachments: many(attachment),
  issueLabels: many(issueLabel),
  activities: many(activity),
  watchers: many(issueWatcher),
}));

// ============================================================================
// ISSUE LABELS (Many-to-many join table)
// ============================================================================

export const issueLabel = pgTable(
  "issue_label",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    issueId: text("issue_id")
      .notNull()
      .references(() => issue.id, { onDelete: "cascade" }),
    labelId: text("label_id")
      .notNull()
      .references(() => label.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    issueLabelUniqueIdx: uniqueIndex("issue_label_unique_idx").on(table.issueId, table.labelId),
  })
);

export const issueLabelRelations = relations(issueLabel, ({ one }) => ({
  issue: one(issue, {
    fields: [issueLabel.issueId],
    references: [issue.id],
  }),
  label: one(label, {
    fields: [issueLabel.labelId],
    references: [label.id],
  }),
}));

// ============================================================================
// ISSUE WATCHERS (Users watching an issue for notifications)
// ============================================================================

export const issueWatcher = pgTable(
  "issue_watcher",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    issueId: text("issue_id")
      .notNull()
      .references(() => issue.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    issueWatcherUniqueIdx: uniqueIndex("issue_watcher_unique_idx").on(table.issueId, table.userId),
  })
);

export const issueWatcherRelations = relations(issueWatcher, ({ one }) => ({
  issue: one(issue, {
    fields: [issueWatcher.issueId],
    references: [issue.id],
  }),
  user: one(user, {
    fields: [issueWatcher.userId],
    references: [user.id],
  }),
}));

// ============================================================================
// COMMENTS
// ============================================================================

export const comment = pgTable(
  "comment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    issueId: text("issue_id")
      .notNull()
      .references(() => issue.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    content: text("content").notNull(), // Rich text / markdown
    // For threaded comments
    parentId: text("parent_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    issueIdIdx: index("comment_issue_id_idx").on(table.issueId),
    authorIdIdx: index("comment_author_id_idx").on(table.authorId),
  })
);

export const commentRelations = relations(comment, ({ one, many }) => ({
  issue: one(issue, {
    fields: [comment.issueId],
    references: [issue.id],
  }),
  author: one(user, {
    fields: [comment.authorId],
    references: [user.id],
  }),
  parent: one(comment, {
    fields: [comment.parentId],
    references: [comment.id],
    relationName: "commentThread",
  }),
  replies: many(comment, { relationName: "commentThread" }),
}));

// ============================================================================
// ATTACHMENTS
// ============================================================================

export const attachment = pgTable(
  "attachment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    issueId: text("issue_id")
      .notNull()
      .references(() => issue.id, { onDelete: "cascade" }),
    uploadedById: text("uploaded_by_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    filename: text("filename").notNull(),
    fileUrl: text("file_url").notNull(),
    fileSize: integer("file_size").notNull(), // in bytes
    mimeType: text("mime_type").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    issueIdIdx: index("attachment_issue_id_idx").on(table.issueId),
  })
);

export const attachmentRelations = relations(attachment, ({ one }) => ({
  issue: one(issue, {
    fields: [attachment.issueId],
    references: [issue.id],
  }),
  uploadedBy: one(user, {
    fields: [attachment.uploadedById],
    references: [user.id],
  }),
}));

// ============================================================================
// ACTIVITY LOG (Audit trail for issues)
// ============================================================================

export const activity = pgTable(
  "activity",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    issueId: text("issue_id")
      .notNull()
      .references(() => issue.id, { onDelete: "cascade" }),
    actorId: text("actor_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    action: text("action").notNull(), // e.g., "created", "updated", "commented", "assigned"
    field: text("field"), // e.g., "status", "assignee", "priority"
    oldValue: text("old_value"),
    newValue: text("new_value"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    issueIdIdx: index("activity_issue_id_idx").on(table.issueId),
    actorIdIdx: index("activity_actor_id_idx").on(table.actorId),
    createdAtIdx: index("activity_created_at_idx").on(table.createdAt),
  })
);

export const activityRelations = relations(activity, ({ one }) => ({
  issue: one(issue, {
    fields: [activity.issueId],
    references: [issue.id],
  }),
  actor: one(user, {
    fields: [activity.actorId],
    references: [user.id],
  }),
}));
