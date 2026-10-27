import { HttpError } from "../lib/httpError.js";
import { prisma } from "../lib/prisma.js";
import type { CreateTaskInput, UpdateTaskInput } from "../validators/task.js";

async function requireTask(id: string) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) {
    throw new HttpError(404, "Task not found");
  }
  return task;
}

export async function listTasks() {
  return prisma.task.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
}

export async function createTask(input: CreateTaskInput) {
  return prisma.task.create({
    data: {
      title: input.title,
      description: input.description ?? null,
    },
  });
}

export async function updateTask(id: string, input: UpdateTaskInput) {
  await requireTask(id);
  return prisma.task.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.completed !== undefined ? { completed: input.completed } : {}),
    },
  });
}

export async function deleteTask(id: string) {
  await requireTask(id);
  await prisma.task.delete({ where: { id } });
}
