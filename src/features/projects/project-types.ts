import { type z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { projects } from "@/server/db/schema";
import { type RouterOutputs } from "@/trpc/react";

export const projectInsertSchema = createInsertSchema(projects);
export const projectSelectSchema = createSelectSchema(projects);

export type ProjectInsert = z.infer<typeof projectInsertSchema>;
export type ProjectSelect = z.infer<typeof projectSelectSchema>;

export type Project = NonNullable<RouterOutputs["project"]["byId"]>;

export type DragItemData = {
  type: "task" | "column";
};
