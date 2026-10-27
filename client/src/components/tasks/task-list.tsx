"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

type TaskListProps = {
  tasks: Task[];
  pendingIds: ReadonlySet<string>;
  emptyMessage: string;
  onToggle: (task: Task, completed: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

export function TaskList({ tasks, pendingIds, emptyMessage, onToggle, onEdit, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {tasks.map((task) => {
        const pending = pendingIds.has(task.id);
        return (
          <li key={task.id} className="flex gap-3 rounded-xl border bg-card p-3 shadow-sm sm:p-4">
            <Checkbox
              className="mt-1"
              checked={task.completed}
              disabled={pending}
              aria-label={task.completed ? `Mark ${task.title} as active` : `Mark ${task.title} as completed`}
              onCheckedChange={(checked) => onToggle(task, checked === true)}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className={cn("font-medium break-words", task.completed && "text-muted-foreground line-through")}>
                  {task.title}
                </p>
                {task.completed ? <Badge>Done</Badge> : null}
              </div>
              {task.description ? (
                <p className="mt-1 text-sm break-words whitespace-pre-wrap text-muted-foreground">{task.description}</p>
              ) : null}
              <p className="mt-2 text-xs text-muted-foreground">Added {formatDate(task.createdAt)}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button type="button" variant="ghost" size="icon" disabled={pending} aria-label={`Edit ${task.title}`} onClick={() => onEdit(task)}>
                <Pencil />
              </Button>
              <Button type="button" variant="ghost" size="icon" disabled={pending} aria-label={`Delete ${task.title}`} onClick={() => onDelete(task)}>
                <Trash2 />
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
