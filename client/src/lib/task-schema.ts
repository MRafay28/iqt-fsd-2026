import { z } from "zod";

export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or fewer"),
  description: z.string().trim().max(2000, "Description must be 2000 characters or fewer"),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
