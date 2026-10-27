"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { taskFormSchema, type TaskFormValues } from "@/lib/task-schema";
import type { TaskDraft } from "@/lib/types";

type TaskComposerProps = {
  onCreate: (draft: TaskDraft) => Promise<void>;
};

export function TaskComposer({ onCreate }: TaskComposerProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    defaultValues: { title: "", description: "" },
  });

  const submit = handleSubmit(async (values) => {
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

    await onCreate({
      title: parsed.data.title,
      description: parsed.data.description.length > 0 ? parsed.data.description : null,
    });
    reset();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a task</CardTitle>
        <CardDescription>Give it a title. A description is optional.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={submit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input id="task-title" placeholder="What needs to be done?" maxLength={200} {...register("title")} />
            {errors.title ? <p className="text-sm text-destructive">{errors.title.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              placeholder="Notes, links, or the next step"
              maxLength={2000}
              {...register("description")}
            />
            {errors.description ? <p className="text-sm text-destructive">{errors.description.message}</p> : null}
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add task"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
