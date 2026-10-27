"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DeleteTaskDialog } from "@/components/tasks/delete-task-dialog";
import { EditTaskDialog } from "@/components/tasks/edit-task-dialog";
import { TaskComposer } from "@/components/tasks/task-composer";
import { TaskList } from "@/components/tasks/task-list";
import { WeatherWidget } from "@/components/weather/weather-widget";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { Task, TaskDraft, TaskFilter } from "@/lib/types";
import { cn } from "@/lib/utils";

const filters: Array<{ id: TaskFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
];

function sortTasks(tasks: Task[]) {
  return [...tasks].sort((left, right) => {
    const byDate = right.createdAt.localeCompare(left.createdAt);
    return byDate === 0 ? right.id.localeCompare(left.id) : byDate;
  });
}

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);

  useEffect(() => {
    let cancelled = false;

    api<Task[]>("/api/tasks")
      .then((data) => {
        if (!cancelled) {
          setTasks(data);
          setError(null);
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Could not load tasks");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function reloadTasks() {
    setLoading(true);
    setError(null);
    try {
      setTasks(await api<Task[]>("/api/tasks"));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load tasks");
    } finally {
      setLoading(false);
    }
  }

  async function withPending(id: string, action: () => Promise<void>) {
    setPendingIds((current) => new Set(current).add(id));
    try {
      await action();
    } finally {
      setPendingIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  }

  function replaceTask(task: Task) {
    setTasks((current) => sortTasks(current.map((item) => (item.id === task.id ? task : item))));
  }

  async function createTask(draft: TaskDraft) {
    try {
      const task = await api<Task>("/api/tasks", {
        method: "POST",
        body: JSON.stringify(draft),
      });
      setTasks((current) => sortTasks([task, ...current]));
      toast.success("Task added");
    } catch (createError) {
      toast.error(createError instanceof Error ? createError.message : "Could not add the task");
      throw createError;
    }
  }

  async function saveTask(id: string, draft: TaskDraft) {
    await withPending(id, async () => {
      try {
        const task = await api<Task>(`/api/tasks/${id}`, {
          method: "PATCH",
          body: JSON.stringify(draft),
        });
        replaceTask(task);
        setEditing(null);
        toast.success("Task updated");
      } catch (saveError) {
        toast.error(saveError instanceof Error ? saveError.message : "Could not update the task");
        throw saveError;
      }
    });
  }

  async function toggleTask(task: Task, completed: boolean) {
    await withPending(task.id, async () => {
      try {
        const updated = await api<Task>(`/api/tasks/${task.id}`, {
          method: "PATCH",
          body: JSON.stringify({ completed }),
        });
        replaceTask(updated);
      } catch (toggleError) {
        toast.error(toggleError instanceof Error ? toggleError.message : "Could not update the task");
      }
    });
  }

  async function confirmDelete(task: Task) {
    await withPending(task.id, async () => {
      try {
        await api<void>(`/api/tasks/${task.id}`, { method: "DELETE" });
        setTasks((current) => current.filter((item) => item.id !== task.id));
        setDeleting(null);
        toast.success("Task deleted");
      } catch (deleteError) {
        toast.error(deleteError instanceof Error ? deleteError.message : "Could not delete the task");
      }
    });
  }

  const counts = useMemo(
    () => ({
      all: tasks.length,
      active: tasks.filter((task) => !task.completed).length,
      completed: tasks.filter((task) => task.completed).length,
    }),
    [tasks],
  );

  const visibleTasks = tasks.filter((task) => {
    if (filter === "active") {
      return !task.completed;
    }
    if (filter === "completed") {
      return task.completed;
    }
    return true;
  });

  const emptyMessage =
    filter === "active"
      ? "Nothing is waiting. Active tasks will show up here."
      : filter === "completed"
        ? "No completed tasks yet."
        : "No tasks yet. Add the first one above.";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-6 border-b pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium tracking-wide text-primary">IQT-FSD-2026</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Taskboard</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            A short list for work you can finish. Add a task, change it, or mark it done.
          </p>
        </div>
        <WeatherWidget />
      </header>

      <TaskComposer onCreate={createTask} />

      <section className="space-y-4" aria-label="Tasks">
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={filter === item.id ? "default" : "outline"}
              className={cn(filter !== item.id && "bg-card")}
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
              <span className="text-xs opacity-80">{counts[item.id]}</span>
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3" aria-label="Loading tasks">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : null}

        {!loading && error ? (
          <div className="rounded-xl border bg-card p-4 text-sm">
            <p className="font-medium">Could not load tasks</p>
            <p className="mt-1 text-muted-foreground">{error}</p>
            <Button type="button" className="mt-3" variant="outline" onClick={() => void reloadTasks()}>
              Try again
            </Button>
          </div>
        ) : null}

        {!loading && !error ? (
          <TaskList
            tasks={visibleTasks}
            pendingIds={pendingIds}
            emptyMessage={emptyMessage}
            onToggle={(task, completed) => void toggleTask(task, completed)}
            onEdit={setEditing}
            onDelete={setDeleting}
          />
        ) : null}
      </section>

      <EditTaskDialog
        task={editing}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
          }
        }}
        onSave={saveTask}
      />
      <DeleteTaskDialog
        task={deleting}
        pending={deleting ? pendingIds.has(deleting.id) : false}
        onOpenChange={(open) => {
          if (!open) {
            setDeleting(null);
          }
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
