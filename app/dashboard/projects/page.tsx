"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Calendar, Flag, MapPin, AlertCircle, Clock, CheckCircle, Pause, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AddProjectDialog } from "@/components/add-project-dialog";
import { Priority, ProjectStatus } from "@/lib/types";

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

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleRowClick = (projectId: number) => {
    router.push(`/dashboard/projects/${projectId}`);
  };

  const getStatusBadge = (status: ProjectStatus) => {
    const statusConfig = {
      ACTIVE: {
        label: 'Active',
        icon: Target,
        className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
      },
      IN_PROGRESS: {
        label: 'In Progress',
        icon: Clock,
        className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
      },
      COMPLETED: {
        label: 'Completed',
        icon: CheckCircle,
        className: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800'
      },
      ON_HOLD: {
        label: 'On Hold',
        icon: Pause,
        className: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'
      }
    };

    const config = statusConfig[status];
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${config.className}`}>
        <IconComponent className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: Priority | undefined) => {
    if (!priority) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700">
          <Flag className="h-3 w-3" />
          None
        </span>
      );
    }

    const priorityConfig = {
      P1: {
        label: 'P1',
        className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
      },
      P2: {
        label: 'P2',
        className: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'
      },
      P3: {
        label: 'P3',
        className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
      }
    };

    const config = priorityConfig[priority];

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${config.className}`}>
        <Flag className="h-3 w-3" />
        {config.label}
      </span>
    );
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
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Projects Dashboard</h1>
          <AddProjectDialog onProjectAdded={fetchProjects} />
        </div>
        <div className="text-center py-8">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Projects Dashboard</h1>
        <AddProjectDialog onProjectAdded={fetchProjects} />
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
              <th className="p-4 font-medium text-left">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Area
                </span>
              </th>
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
                <td colSpan={6} className="p-4 text-center text-muted-foreground">
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
                  <td className="py-2 px-4">
                    {project.area ? (
                      <span className="inline-flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {project.area.name}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">No area</span>
                    )}
                  </td>
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
                          onClick={(e) => e.stopPropagation()}
                          className="text-red-500 focus:text-red-500"
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
