import { type z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { comments } from "@/server/db/schema";

export const commentInsertSchema = createInsertSchema(comments);
export type CommentInsert = z.infer<typeof commentInsertSchema>;

export const commentSelectSchema = createSelectSchema(comments);
export type CommentSelect = z.infer<typeof commentSelectSchema>;

export const commentCreateSelectSchema = createSelectSchema(comments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CommentCreateSelect = z.infer<typeof commentCreateSelectSchema>;
