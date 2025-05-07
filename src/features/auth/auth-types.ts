import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { user } from "@/server/db/schema";

export const userInsertSchema = createInsertSchema(user);
export const userSelectSchema = createSelectSchema(user);

export type UserInsert = z.infer<typeof userInsertSchema>;
export type UserSelect = z.infer<typeof userSelectSchema>;

export const userProfileFormSchema = userSelectSchema.pick({
  id: true,
  name: true,
  email: true,
  image: true,
});

export type UserProfileForm = z.infer<typeof userProfileFormSchema>;

export const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});
export type LoginSchemaType = z.infer<typeof LoginSchema>;
