import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { columns } from "@/server/db/schema";

export const columnInsertSchema = createInsertSchema(columns);
export type ColumnInsert = z.infer<typeof columnInsertSchema>;
export const columnSelectSchema = createSelectSchema(columns);
export type ColumnSelect = z.infer<typeof columnSelectSchema>;
export const columnCreateSelectSchema = createSelectSchema(columns)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    position: true,
    projectId: true,
  })
  .extend({
    projectId: z.number().nullable().optional(),
  });

export type ColumnCreateSelect = z.infer<typeof columnCreateSelectSchema>;
