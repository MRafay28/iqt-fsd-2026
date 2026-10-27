import { TaskBoard } from "@/components/tasks/task-board";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8">
      <TaskBoard />
    </main>
  );
}
