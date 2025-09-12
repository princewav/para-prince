"use client";

import { ProjectsTable } from "@/components/projects-table";

export default function ProjectsPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Projects Dashboard</h1>
      </div>
      
      <ProjectsTable showAreaColumn={true} />
    </div>
  );
}
