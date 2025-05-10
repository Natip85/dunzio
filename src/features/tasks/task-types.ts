import { type z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { tasks } from "@/server/db/schema";

export const taskInsertSchema = createInsertSchema(tasks);
export type TaskInsert = z.infer<typeof taskInsertSchema>;

export const taskSelectSchema = createSelectSchema(tasks);
export type TaskSelect = z.infer<typeof taskSelectSchema>;

export const taskCreateSelectSchema = createSelectSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type TaskCreateSelect = z.infer<typeof taskCreateSelectSchema>;
