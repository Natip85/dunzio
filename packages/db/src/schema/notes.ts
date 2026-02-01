import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { boolean, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { folder } from "./folders";

// TipTap JSONContent type for content storage
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

export const note = pgTable("note", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text("title").notNull().default(""),
  content: jsonb("content").$type<JSONContent>(),
  plainText: text("plain_text").notNull().default(""),
  pinned: boolean("pinned").notNull().default(false),
  folderId: text("folder_id")
    .notNull()
    .references(() => folder.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type Note = typeof note.$inferSelect;
export type NewNote = typeof note.$inferInsert;

export const noteRelations = relations(note, ({ one }) => ({
  folder: one(folder, {
    fields: [note.folderId],
    references: [folder.id],
  }),
  user: one(user, {
    fields: [note.userId],
    references: [user.id],
  }),
}));
