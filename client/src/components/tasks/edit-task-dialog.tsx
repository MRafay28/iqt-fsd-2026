"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { taskFormSchema, type TaskFormValues } from "@/lib/task-schema";
import type { Task, TaskDraft } from "@/lib/types";

type EditTaskDialogProps = {
  task: Task | null;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, draft: TaskDraft) => Promise<void>;
};

export function EditTaskDialog({ task, onOpenChange, onSave }: EditTaskDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    defaultValues: { title: "", description: "" },
  });

  useEffect(() => {
    if (task) {
      reset({ title: task.title, description: task.description ?? "" });
    }
  }, [task, reset]);

  const submit = handleSubmit(async (values) => {
    if (!task) {
      return;
    }

    const parsed = taskFormSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === "title" || field === "description") {
          setError(field, { message: issue.message });
        }
      }
      return;
    }

    await onSave(task.id, {
      title: parsed.data.title,
      description: parsed.data.description.length > 0 ? parsed.data.description : null,
    });
  });

  return (
    <Dialog open={task !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
          <DialogDescription>Update the title or description, then save.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input id="edit-title" maxLength={200} {...register("title")} />
            {errors.title ? <p className="text-sm text-destructive">{errors.title.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea id="edit-description" maxLength={2000} {...register("description")} />
            {errors.description ? <p className="text-sm text-destructive">{errors.description.message}</p> : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
