"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Project {
  id: number;
  name: string;
  description?: string;
  status: string;
  priority?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) throw new Error('Failed to fetch projects');
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  const handleRowClick = (projectId: number) => {
    router.push(`/dashboard/projects/${projectId}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Projects Dashboard</h1>
          <Button>Add New Project</Button>
        </div>
        <div className="text-center py-8">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Projects Dashboard</h1>
        <Button>Add New Project</Button>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-4 font-medium">Project Name</th>
              <th className="p-4 font-medium">Due Date</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Priority</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-muted-foreground">
                  No projects found
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b last:border-b-0 cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(project.id)}
                >
                  <td className="p-4">{project.name}</td>
                  <td className="p-4">{project.dueDate ? new Date(project.dueDate).toLocaleDateString() : '-'}</td>
                  <td className="p-4">{project.status.replace('_', ' ')}</td>
                  <td className="p-4">{project.priority || '-'}</td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => e.stopPropagation()}
                          className="text-red-500"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}