import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import { createTask, deleteTask, listTasks, updateTask } from "../services/taskService.js";
import {
  createTaskSchema,
  taskIdSchema,
  updateTaskSchema,
  type CreateTaskInput,
  type UpdateTaskInput,
} from "../validators/task.js";

export const taskRouter = Router();

taskRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const tasks = await listTasks();
    res.json({ data: tasks });
  }),
);

taskRouter.post(
  "/",
  validateBody(createTaskSchema),
  asyncHandler(async (_req, res) => {
    const task = await createTask(res.locals.body as CreateTaskInput);
    res.status(201).json({ data: task });
  }),
);

taskRouter.patch(
  "/:id",
  validateParams(taskIdSchema),
  validateBody(updateTaskSchema),
  asyncHandler(async (_req, res) => {
    const { id } = res.locals.params as { id: string };
    const task = await updateTask(id, res.locals.body as UpdateTaskInput);
    res.json({ data: task });
  }),
);

taskRouter.delete(
  "/:id",
  validateParams(taskIdSchema),
  asyncHandler(async (_req, res) => {
    const { id } = res.locals.params as { id: string };
    await deleteTask(id);
    res.status(204).send();
  }),
);
