"use client";

import { TasksTable } from "@/components/tasks-table";

export default function TasksPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">All Tasks</h1>
        <p className="text-muted-foreground mt-1">View and manage all your tasks across projects and areas</p>
      </div>

      <TasksTable 
        title="All Tasks"
        showProjectColumn={true}
      />
    </div>
  );
}