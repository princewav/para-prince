"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Calendar, Flag, MapPin, AlertCircle, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AddProjectDialog } from "@/components/add-project-dialog";
import { Priority, ProjectStatus } from "@/lib/types";
import { getStatusBadge, getPriorityBadge } from "@/lib/badge-utils";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";

interface Project {
  id: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority?: Priority;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  area?: {
    id: number;
    name: string;
  };
  _count?: {
    tasks: number;
  };
}

interface ProjectsTableProps {
  areaId?: number;
  showAreaColumn?: boolean;
  onProjectAdded?: () => void;
}

export function ProjectsTable({ areaId, showAreaColumn = false, onProjectAdded }: ProjectsTableProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const url = areaId 
        ? `/api/projects?areaId=${areaId}` 
        : '/api/projects';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      
      // If filtering by area, filter the results
      const filteredData = areaId 
        ? data.filter((project: Project) => project.area?.id === areaId)
        : data;
      
      setProjects(filteredData);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [areaId]);

  const handleRowClick = (projectId: number) => {
    router.push(`/dashboard/projects/${projectId}`);
  };

  const handleProjectAdded = () => {
    fetchProjects();
    if (onProjectAdded) {
      onProjectAdded();
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
      
      // Remove project from state
      setProjects(projects.filter(project => project.id !== projectId));
      setProjectToDelete(null);
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const openDeleteDialog = (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const getDaysLeft = (dueDate: string | undefined) => {
    if (!dueDate) return null;
    
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getDueDateDisplay = (dueDate: string | undefined) => {
    if (!dueDate) {
      return (
        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>No due date</span>
        </span>
      );
    }

    const daysLeft = getDaysLeft(dueDate);
    const formattedDate = new Date(dueDate).toLocaleDateString();
    
    let textColor = 'text-muted-foreground';
    if (daysLeft !== null) {
      if (daysLeft < 0) {
        textColor = 'text-red-600 font-medium';
      } else if (daysLeft === 0) {
        textColor = 'text-amber-600 font-medium';
      } else if (daysLeft <= 3) {
        textColor = 'text-amber-700';
      }
    }

    return (
      <span className={`inline-flex items-center gap-1 text-sm ${textColor}`}>
        <Calendar className="h-4 w-4" />
        <span>{formattedDate}</span>
        {daysLeft !== null && (
          <span className="text-xs opacity-75">
            {daysLeft < 0 ? `(+${Math.abs(daysLeft)}d)` :
             daysLeft === 0 ? '(today)' :
             `(-${daysLeft}d)`}
          </span>
        )}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">Loading projects...</div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Projects</h2>
        <AddProjectDialog onProjectAdded={handleProjectAdded} defaultAreaId={areaId} />
      </div>

      <div className="rounded-md border">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-4 font-medium text-left">
                <span className="inline-flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  Project Name
                </span>
              </th>
              {showAreaColumn && (
                <th className="p-4 font-medium text-left">
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Area
                  </span>
                </th>
              )}
              <th className="p-4 font-medium text-left">
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Due Date
                </span>
              </th>
              <th className="p-4 font-medium text-left">
                <span className="inline-flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  Status
                </span>
              </th>
              <th className="p-4 font-medium text-left">
                <span className="inline-flex items-center gap-2">
                  <Flag className="h-4 w-4 text-muted-foreground" />
                  Priority
                </span>
              </th>
              <th className="p-4 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan={showAreaColumn ? 6 : 5} className="p-4 text-center text-muted-foreground">
                  No projects found
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b last:border-b-0 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => handleRowClick(project.id)}
                >
                  <td className="py-2 px-4">
                    <div className="flex flex-col ">
                      <span className="font-medium">{project.name}</span>
                      {project._count && (
                        <span className="text-xs text-muted-foreground">
                          {project._count.tasks} task{project._count.tasks !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </td>
                  {showAreaColumn && (
                    <td className="py-2 px-4">
                      {project.area ? (
                        <span className="inline-flex items-center gap-1 text-sm">
                          {project.area.name}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">No area</span>
                      )}
                    </td>
                  )}
                  <td className="py-2 px-4">
                    {getDueDateDisplay(project.dueDate)}
                  </td>
                  <td className="py-2 px-4">
                    {getStatusBadge(project.status)}
                  </td>
                  <td className="py-2 px-4">
                    {getPriorityBadge(project.priority)}
                  </td>
                  <td className="py-2 px-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => e.stopPropagation()}
                          className="hover:bg-muted"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteDialog(project);
                          }}
                          className="text-destructive focus:text-destructive cursor-pointer"
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
      
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => projectToDelete && handleDeleteProject(projectToDelete.id)}
        title="Delete Project"
        description="Are you sure you want to delete this project?"
        itemName={projectToDelete?.name || ''}
      />
    </div>
  );
}