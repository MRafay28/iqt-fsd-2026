import { z } from "zod";

const titleSchema = z.string().trim().min(1, "Title is required").max(200);
const descriptionSchema = z
  .string()
  .trim()
  .max(2000)
  .nullable()
  .optional()
  .transform((value) => (value === "" ? null : value));

export const createTaskSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
});

export const updateTaskSchema = z
  .object({
    title: titleSchema.optional(),
    description: descriptionSchema,
    completed: z.boolean().optional(),
  })
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: "At least one field is required",
  });

export const taskIdSchema = z.object({
  id: z.uuid("Task id must be a UUID"),
});

export const weatherQuerySchema = z.object({
  city: z.string().trim().min(1, "City is required").max(100),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
