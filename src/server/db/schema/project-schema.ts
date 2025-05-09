import { text, integer, serial, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from ".";
import * as Utils from "./utils";
// import * as C from "./schema-constants";

// const taskTypeEnum = pgEnum("task_type", C.TaskTypes);

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
    projectId: integer("task_project_id").references(() => projects.id),
    ...Utils.createUpdateTimestamps,
  },
  (table) => ({
    projectIdIdx: index("task_project_id_idx").on(table.projectId),
    columnIdIdx: index("task_column_id_idx").on(table.columnId),
  }),
);

export const tasksRelations = relations(tasks, ({ one }) => ({
  column: one(columns, {
    fields: [tasks.columnId],
    references: [columns.id],
  }),
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
}));

// ---------------- Labels ----------------

// export const labels = pgTable("labels", {
//   id: serial("id").primaryKey(),
//   name: text("name").notNull(),
//   color: text("color"), // hex or tailwind class
//   projectId: integer("project_id").references(() => projects.id, {
//     onDelete: "cascade",
//   }),
// });

// export const taskLabels = pgTable("task_labels", {
//   taskId: integer("task_id").references(() => tasks.id, { onDelete: "cascade" }),
//   labelId: integer("label_id").references(() => labels.id, { onDelete: "cascade" }),
// });
