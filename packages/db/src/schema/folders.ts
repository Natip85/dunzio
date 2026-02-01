import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";

export const folder = pgTable("folder", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  parentId: text("parent_id"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type Folder = typeof folder.$inferSelect;
export type NewFolder = typeof folder.$inferInsert;

export const folderRelations = relations(folder, ({ one, many }) => ({
  parent: one(folder, {
    fields: [folder.parentId],
    references: [folder.id],
    relationName: "folderToSubfolders",
  }),
  subfolders: many(folder, {
    relationName: "folderToSubfolders",
  }),
  user: one(user, {
    fields: [folder.userId],
    references: [user.id],
  }),
}));
