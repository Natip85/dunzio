import { text, integer, serial, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from ".";
import * as Utils from "./utils";

// ---------------- Projects ----------------
export const projects = Utils.createTable(
  "projects",
  {
    id: serial("id").primaryKey(),
    userId: Utils.userId().references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    ...Utils.createUpdateTimestamps,
  },
  (table) => ({
    nameIdx: index("project_name_idx").on(table.name),
    userIdIdx: index("project_user_id_idx").on(table.userId),
  }),
);

export const projectRelations = relations(projects, ({ one, many }) => ({
  user: one(user, {
    fields: [projects.userId],
    references: [user.id],
  }),
  cols: many(columns),
  tasks: many(tasks),
  members: many(projectMembers),
}));

// ---------------- Columns ----------------
export const columns = Utils.createTable(
  "columns",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id").references(() => projects.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    description: text("description"),
    color: text("color").notNull().default("#CCCCCC"),
    position: integer("position").notNull().default(0),
    ...Utils.createUpdateTimestamps,
  },
  (table) => ({
    projectIdIdx: index("column_project_id_idx").on(table.projectId),
  }),
);

export const columnsRelations = relations(columns, ({ one, many }) => ({
  project: one(projects, {
    fields: [columns.projectId],
    references: [projects.id],
  }),
  colTasks: many(tasks),
}));

// ---------------- Tasks ----------------
export const tasks = Utils.createTable(
  "tasks",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    columnId: integer("column_id").references(() => columns.id, {
      onDelete: "cascade",
    }),
    projectId: integer("task_project_id").references(() => projects.id, {
      onDelete: "cascade",
    }),
    createdBy: Utils.userId().references(() => user.id, {
      onDelete: "cascade",
    }),
    ...Utils.createUpdateTimestamps,
  },
  (table) => ({
    projectIdIdx: index("task_project_id_idx").on(table.projectId),
    columnIdIdx: index("task_column_id_idx").on(table.columnId),
  }),
);

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  column: one(columns, {
    fields: [tasks.columnId],
    references: [columns.id],
  }),
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  createdBy: one(user, {
    fields: [tasks.createdBy],
    references: [user.id],
  }),
  comments: many(comments),
}));

// ---------------- Comments ----------------
export const comments = Utils.createTable(
  "comments",
  {
    id: serial("id").primaryKey(),
    taskId: integer("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    userId: Utils.userId()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    ...Utils.createUpdateTimestamps,
  },
  (table) => ({
    taskIdIdx: index("comment_task_id_idx").on(table.taskId),
    userIdIdx: index("comment_user_id_idx").on(table.userId),
  }),
);

export const commentsRelations = relations(comments, ({ one }) => ({
  task: one(tasks, {
    fields: [comments.taskId],
    references: [tasks.id],
  }),
  user: one(user, {
    fields: [comments.userId],
    references: [user.id],
  }),
}));

// ---------------- Members join table ----------------
export const projectMembers = Utils.createTable(
  "project_members",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: Utils.userId()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // role: text("role").notNull().default("viewer"), // e.g. 'viewer', 'editor', 'owner'
    invitedBy: Utils.userId().references(() => user.id, {
      onDelete: "set null",
    }),
    ...Utils.createUpdateTimestamps,
  },
  (table) => ({
    uniqueIdx: index("project_member_unique_idx").on(
      table.projectId,
      table.userId,
    ),
  }),
);

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  user: one(user, {
    fields: [projectMembers.userId],
    references: [user.id],
  }),
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
}));
