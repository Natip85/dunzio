import { type z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { tasks } from "@/server/db/schema";

export const taskInsertSchema = createInsertSchema(tasks);
export const taskSelectSchema = createSelectSchema(tasks);

export type TaskInsert = z.infer<typeof taskInsertSchema>;
export type TaskSelect = z.infer<typeof taskSelectSchema>;
