"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Card as CardVariant,
  CardContent as CardContentVariant,
} from "@/components/ui/card-variant";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AreaCombobox } from "@/components/area-combobox";
import { ArrowLeft, Calendar, AlertCircle, Flag, Plus, FileText, Check, List, Zap, MapPin, Edit } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { projectsApi, tasksApi, areasApi } from "@/lib/api";
import { ProjectWithTasks, TaskWithRelations, Priority, Energy, Context, ProjectStatus, AreaWithTasks } from "@/lib/types";
import { getPriorityColor, getEnergyColor, getContextColor, getProjectStatusColor } from "@/lib/badge-utils";

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams();
  const { projectId } = params;

  const [project, setProject] = useState<ProjectWithTasks | null>(null);
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [areas, setAreas] = useState<AreaWithTasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState(false);
  const [editingProjectField, setEditingProjectField] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<Priority | "none" | null>(null);
  const [newTaskEnergy, setNewTaskEnergy] = useState<Energy | "none" | null>(null);
  const [newTaskContext, setNewTaskContext] = useState<Context | "none" | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const addTaskRowRef = useRef<HTMLTableRowElement>(null);

  const sortTasks = (tasksToSort: TaskWithRelations[]) => {
    const priorityOrder: Record<Priority, number> = { P1: 1, P2: 2, P3: 3 };
    return [...tasksToSort].sort((a, b) => {
      const aPriority = a.priority ? priorityOrder[a.priority] || 5 : 5;
      const bPriority = b.priority ? priorityOrder[b.priority] || 5 : 5;
      
      // Primary sort: by priority
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // Secondary sort: by due date (earliest first)
      // Tasks without due dates go last within same priority
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  };

  // Load project, tasks and areas on mount
  useEffect(() => {
    const loadProjectData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [projectData, areasData] = await Promise.all([
          projectsApi.getById(parseInt(projectId as string)),
          areasApi.getAll()
        ]);
        setProject(projectData);
        setTasks(sortTasks(projectData.tasks));
        setAreas(areasData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  // Handle click outside to dismiss add task form
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isAddingTask && addTaskRowRef.current && !addTaskRowRef.current.contains(event.target as Node)) {
        handleCancelAdd();
      }
    };

    if (isAddingTask) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAddingTask]);

  const handleAddTask = async () => {
    if (newTaskName) {
      try {
        const newTask = await tasksApi.create({
          name: newTaskName,
          dueDate: newTaskDueDate || null,
          priority: newTaskPriority === "none" ? null : newTaskPriority,
          energy: newTaskEnergy === "none" ? null : newTaskEnergy,
          context: newTaskContext === "none" ? null : newTaskContext,
          projectId: parseInt(projectId as string),
        });
        
        const updatedTasks = [...tasks, newTask];
        setTasks(sortTasks(updatedTasks));
        
        setNewTaskName("");
        setNewTaskDueDate("");
        setNewTaskPriority(null);
        setNewTaskEnergy(null);
        setNewTaskContext(null);
        setIsAddingTask(false);
      } catch (err) {
        console.error('Failed to create task:', err);
      }
    }
  };

  const handleCancelAdd = () => {
    setNewTaskName("");
    setNewTaskDueDate("");
    setNewTaskPriority(null);
    setNewTaskEnergy(null);
    setNewTaskContext(null);
    setIsAddingTask(false);
  };


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTaskName) {
      handleAddTask();
    } else if (e.key === 'Escape') {
      handleCancelAdd();
    }
  };

  const handleToggleTask = async (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const updatedTask = await tasksApi.toggleComplete(taskId, !task.completed);
      setTasks(tasks.map((t) => t.id === taskId ? updatedTask : t));
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleEditTask = async (taskId: number, field: string, value: string) => {
    try {
      let updateData: any = {};
      
      if (field === 'priority') {
        updateData.priority = value === 'none' ? null : value as Priority;
      } else if (field === 'energy') {
        updateData.energy = value === 'none' ? null : value as Energy;
      } else if (field === 'context') {
        updateData.context = value === 'none' ? null : value as Context;
      } else {
        updateData[field] = value;
      }

      const updatedTask = await tasksApi.update(taskId, updateData);
      const updatedTasks = tasks.map((task) => task.id === taskId ? updatedTask : task);
      
      // Resort if priority or due date changed
      if (field === 'priority' || field === 'dueDate') {
        setTasks(sortTasks(updatedTasks));
      } else {
        setTasks(updatedTasks);
      }
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const startEditing = (taskId: number, field: string) => {
    setEditingTask(taskId);
    setEditingField(field);
  };

  const stopEditing = () => {
    setEditingTask(null);
    setEditingField(null);
  };

  const handleEditKeyPress = (e: React.KeyboardEvent, taskId: number, field: string, value: string) => {
    if (e.key === 'Enter') {
      handleEditTask(taskId, field, value);
      stopEditing();
    } else if (e.key === 'Escape') {
      stopEditing();
    }
  };

  const handleEditProject = async (field: string, value: string | null) => {
    if (!project) return;
    
    try {
      let updateData: any = {};
      
      if (field === 'priority') {
        updateData.priority = value === 'none' ? null : value as Priority;
      } else if (field === 'status') {
        updateData.status = value as ProjectStatus;
      } else if (field === 'areaId') {
        updateData.areaId = value ? parseInt(value) : null;
      } else {
        updateData[field] = value;
      }

      const updatedProject = await projectsApi.update(project.id, updateData);
      setProject(updatedProject);
    } catch (err) {
      console.error('Failed to update project:', err);
    }
  };

  const startEditingProject = (field: string) => {
    setEditingProject(true);
    setEditingProjectField(field);
  };

  const stopEditingProject = () => {
    setEditingProject(false);
    setEditingProjectField(null);
  };

  const handleProjectKeyPress = (e: React.KeyboardEvent, field: string, value: string) => {
    if (e.key === 'Enter') {
      handleEditProject(field, value);
      stopEditingProject();
    } else if (e.key === 'Escape') {
      stopEditingProject();
    }
  };

  const handleCreateArea = async (name: string) => {
    try {
      const newArea = await areasApi.create({ name });
      setAreas([...areas, newArea]);
      return newArea;
    } catch (err) {
      console.error('Failed to create area:', err);
      throw err;
    }
  };


  const getDaysLeft = (dueDate: string) => {
    if (!dueDate) return null;
    
    const today = new Date('2025-09-08'); // Current date as specified
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const formatDaysLeft = (daysLeft: number | null) => {
    if (daysLeft === null) return '';
    
    if (daysLeft < 0) {
      return `(+${Math.abs(daysLeft)}d)`;
    } else if (daysLeft === 0) {
      return '(today)';
    } else {
      return `(-${daysLeft}d)`;
    }
  };

  const getDueDateClass = (dueDate: string) => {
    const daysLeft = getDaysLeft(dueDate);
    if (daysLeft === null) return '';
    
    if (daysLeft < 0) {
      return 'text-destructive font-medium'; // Overdue
    } else if (daysLeft === 0) {
      return 'text-amber-600 font-medium'; // Due today
    } else if (daysLeft <= 3) {
      return 'text-amber-700'; // Due soon
    }
    
    return '';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft />
          </Button>
          <h1 className="text-3xl font-bold ml-4">Loading...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft />
          </Button>
          <h1 className="text-3xl font-bold ml-4 text-red-600">Error: {error}</h1>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft />
          </Button>
          <h1 className="text-3xl font-bold ml-4">Project not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <div className="flex-1 ml-4" onClick={() => !editingProject && startEditingProject('name')}>
          {editingProject && editingProjectField === 'name' ? (
            <Input
              defaultValue={project.name}
              onBlur={(e) => {
                handleEditProject('name', e.target.value);
                stopEditingProject();
              }}
              onKeyDown={(e) => handleProjectKeyPress(e, 'name', (e.target as HTMLInputElement).value)}
              className="text-3xl font-bold border border-border/40 shadow-none focus-visible:ring-0 focus-visible:border-ring px-3 py-2 bg-transparent h-auto rounded-md"
              autoFocus
            />
          ) : (
            <h1 className="text-3xl font-bold cursor-pointer hover:bg-muted/20 px-3 py-2 rounded -mx-3 -my-2">
              {project.name}
            </h1>
          )}
        </div>
        <div className="ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingProject(!editingProject)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-4 w-4 mr-2" />
            {editingProject ? 'Done' : 'Edit'}
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <CardVariant padding="sm" className="p-4 pt-2">
          <CardContentVariant padding="sm" className="">
            <div className="flex items-center gap-4 mb-4 mt-1">
              {/* Due Date */}
              <div className="flex items-center gap-2 py-1" onClick={() => startEditingProject('dueDate')}>
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {editingProject && editingProjectField === 'dueDate' ? (
                  <Input
                    type="date"
                    defaultValue={project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : ''}
                    onBlur={(e) => {
                      handleEditProject('dueDate', e.target.value || null);
                      stopEditingProject();
                    }}
                    onKeyDown={(e) => handleProjectKeyPress(e, 'dueDate', (e.target as HTMLInputElement).value)}
                    className="h-6 w-32 text-xs border border-border/40 shadow-none focus-visible:ring-0 focus-visible:border-ring px-2 py-1 bg-transparent rounded-md"
                    autoFocus
                  />
                ) : (
                  <span className="text-sm font-medium cursor-pointer hover:bg-muted/20 px-1 py-0.5 rounded">
                    {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No due date'}
                  </span>
                )}
              </div>
              
              {/* Status */}
              <div className="flex items-center gap-2 py-1" onClick={() => startEditingProject('status')}>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                {editingProject && editingProjectField === 'status' ? (
                  <Select
                    defaultValue={project.status}
                    onValueChange={(value: string) => {
                      handleEditProject('status', value);
                      stopEditingProject();
                    }}
                  >
                    <SelectTrigger className="w-28 h-6 border-none shadow-none focus:ring-0 bg-transparent text-xs px-2 py-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="ON_HOLD">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border cursor-pointer hover:opacity-80 transition-opacity ${getProjectStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ').toLocaleLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                  </span>
                )}
              </div>
              
              {/* Priority */}
              <div className="flex items-center gap-2 py-1" onClick={() => startEditingProject('priority')}>
                <Flag className="h-4 w-4 text-muted-foreground" />
                {editingProject && editingProjectField === 'priority' ? (
                  <Select
                    defaultValue={project.priority || 'none'}
                    onValueChange={(value: string) => {
                      handleEditProject('priority', value);
                      stopEditingProject();
                    }}
                  >
                    <SelectTrigger className="w-20 h-6 border-none shadow-none focus:ring-0 bg-transparent text-xs px-2 py-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="P1">P1</SelectItem>
                      <SelectItem value="P2">P2</SelectItem>
                      <SelectItem value="P3">P3</SelectItem>
                    </SelectContent>
                  </Select>
                ) : project.priority ? (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border cursor-pointer hover:opacity-80 transition-opacity ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </span>
                ) : (
                  <span className="cursor-pointer hover:bg-muted/20 px-2 py-1 rounded text-muted-foreground text-xs">
                    No priority
                  </span>
                )}
              </div>
              
              {/* Area */}
              <div className="flex items-center gap-2 py-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {editingProjectField === 'areaId' ? (
                  <div className="w-40" onClick={(e) => e.stopPropagation()}>
                    <AreaCombobox
                      areas={areas as any}
                      value={((project as any).areaId)?.toString() || ''}
                      onValueChange={(value) => {
                        handleEditProject('areaId', value);
                        setEditingProjectField(null);
                      }}
                      onCreateArea={handleCreateArea as any}
                      placeholder="Select area..."
                    />
                  </div>
                ) : (
                  <span 
                    className="text-sm font-medium cursor-pointer hover:bg-muted/20 px-1 py-0.5 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProjectField('areaId');
                    }}
                  >
                    {areas.find(a => a.id === (project as any).areaId)?.name || 'No area'}
                  </span>
                )}
              </div>
            </div>
            
            {/* Project Description */}
            <div onClick={() => startEditingProject('description')}>
              {editingProject && editingProjectField === 'description' ? (
                <Textarea
                  defaultValue={project.description || ''}
                  onBlur={(e) => {
                    handleEditProject('description', e.target.value || null);
                    stopEditingProject();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      stopEditingProject();
                    }
                  }}
                  className="text-sm text-muted-foreground leading-relaxed border border-border/40 shadow-none focus-visible:ring-0 focus-visible:border-ring px-2 py-1 bg-transparent h-7 rounded-md resize-none overflow-hidden"
                  placeholder="Add project description..."
                  autoFocus
                />
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed cursor-pointer hover:bg-muted/20 px-2 py-1 rounded -mx-2 -my-1 h-7 flex items-center truncate">
                  {project.description || (
                    <span className="text-muted-foreground/50 italic">Add project description...</span>
                  )}
                </p>
              )}
            </div>
          </CardContentVariant>
        </CardVariant>
      </div>

      <Card className="pt-2">
        <CardContent>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="px-3 py-2 font-medium w-4 text-center" title="Completed">
                  <Check className="h-4 w-4 mx-auto text-muted-foreground" />
                </th>
                <th className="px-3 py-2 font-medium w-4 text-center" title="Notes">
                  <FileText className="h-4 w-4 mx-auto text-muted-foreground" />
                </th>
                <th className="px-3 py-2 font-medium w-48" title="Task Name">
                  <List className="h-4 w-4 mr-2 text-muted-foreground inline-block" />
                  <span className="text-sm">Task</span>
                </th>
                <th className="px-3 py-2 font-medium w-32" title="Due Date">
                  <Calendar className="h-4 w-4 mx-auto text-muted-foreground" />
                </th>
                <th className="px-3 py-2 font-medium w-8 text-center" title="Priority">
                  <Flag className="h-4 w-4 mx-auto text-muted-foreground" />
                </th>
                <th className="px-3 py-2 font-medium w-12 text-center" title="Energy">
                  <Zap className="h-4 w-4 mx-auto text-muted-foreground" />
                </th>
                <th className="px-3 py-2 font-medium w-20 text-center" title="Context">
                  <MapPin className="h-4 w-4 mx-auto text-muted-foreground" />
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b last:border-b-0">
                  <td className="p-1 h-14 align-middle leading-none text-center">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleToggleTask(task.id)}
                    />
                  </td>
                  <td className="p-1 h-14 align-middle leading-none text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-muted/50"
                      title="View Notes"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/projects/${projectId}/tasks/${task.id}/notes`);
                      }}
                    >
                      <FileText className={`h-3 w-3 ${task.notes && task.notes.trim() ? 'text-foreground' : 'text-muted-foreground/50'}`} />
                    </Button>
                  </td>
                  <td
                    className={`p-1 h-14 align-middle leading-none w-48 ${
                      task.completed ? "line-through text-muted-foreground" : ""
                    }`}
                    onClick={() => startEditing(task.id, "name")}
                  >
                    {editingTask === task.id && editingField === "name" ? (
                      <Input
                        defaultValue={task.name}
                        onBlur={(e) => {
                          handleEditTask(task.id, "name", e.target.value);
                          stopEditing();
                        }}
                        onKeyDown={(e) =>
                          handleEditKeyPress(
                            e,
                            task.id,
                            "name",
                            (e.target as HTMLInputElement).value
                          )
                        }
                        className="border border-border/40 shadow-none focus-visible:ring-0 focus-visible:border-ring px-2 py-2 bg-transparent h-8 w-full min-w-0 rounded-md"
                        autoFocus
                      />
                    ) : (
                      <div className="cursor-pointer hover:bg-muted/20 px-2 py-1 rounded -mx-2 -my-1 w-full overflow-hidden">
                        <span className="block truncate" title={task.name}>
                          {task.name}
                        </span>
                      </div>
                    )}
                  </td>
                  <td
                    className={`p-1 h-14 align-middle leading-none ${
                      task.completed ? "line-through text-muted-foreground" : ""
                    }`}
                    onClick={() => startEditing(task.id, "dueDate")}
                  >
                    {editingTask === task.id && editingField === "dueDate" ? (
                      <Input
                        type="date"
                        defaultValue={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                        onBlur={(e) => {
                          handleEditTask(task.id, "dueDate", e.target.value);
                          stopEditing();
                        }}
                        onKeyDown={(e) =>
                          handleEditKeyPress(
                            e,
                            task.id,
                            "dueDate",
                            (e.target as HTMLInputElement).value
                          )
                        }
                        className="relative border border-border/40 shadow-none focus-visible:ring-0 focus-visible:border-ring px-2 py-2 bg-transparent h-8 w-36 min-w-0 rounded-md [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2"
                        autoFocus
                      />
                    ) : (
                      <span className="cursor-pointer hover:bg-muted/20 px-2 py-1 rounded -mx-2 -my-1">
                        {task.dueDate ? (
                          <span className={getDueDateClass(new Date(task.dueDate).toISOString().split('T')[0])}>
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                            <span className="text-xs ml-1 opacity-75">
                              {formatDaysLeft(getDaysLeft(new Date(task.dueDate).toISOString().split('T')[0]))}
                            </span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </span>
                    )}
                  </td>
                  <td
                    className="p-1 h-14 align-middle leading-none text-center"
                    onClick={() => startEditing(task.id, "priority")}
                  >
                    {editingTask === task.id && editingField === "priority" ? (
                      <Select
                        defaultValue={task.priority || "none"}
                        onValueChange={(value: string) => {
                          handleEditTask(task.id, "priority", value);
                          stopEditing();
                        }}
                      >
                        <SelectTrigger className="w-16 h-5 border-none shadow-none focus:ring-0 bg-transparent text-xs px-2 py-0 text-center mx-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">—</SelectItem>
                          <SelectItem value="P1">P1</SelectItem>
                          <SelectItem value="P2">P2</SelectItem>
                          <SelectItem value="P3">P3</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : task.priority ? (
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full border cursor-pointer hover:opacity-80 transition-opacity ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    ) : (
                      <span className="cursor-pointer hover:bg-muted/20 px-2 py-1 rounded text-muted-foreground/50 text-xs">
                        —
                      </span>
                    )}
                  </td>
                  <td
                    className="p-1 h-14 align-middle leading-none text-center"
                    onClick={() => startEditing(task.id, "energy")}
                  >
                    {editingTask === task.id && editingField === "energy" ? (
                      <Select
                        defaultValue={task.energy || "none"}
                        onValueChange={(value: string) => {
                          handleEditTask(task.id, "energy", value);
                          stopEditing();
                        }}
                      >
                        <SelectTrigger className="w-20 h-5 border-none shadow-none focus:ring-0 bg-transparent text-xs px-2 py-0 text-center mx-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">—</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="LOW">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : task.energy ? (
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full border cursor-pointer hover:opacity-80 transition-opacity ${getEnergyColor(
                          task.energy
                        )}`}
                      >
                        {task.energy === 'HIGH' ? 'High' : 
                         task.energy === 'MEDIUM' ? 'Medium' :
                         task.energy === 'LOW' ? 'Low' : task.energy}
                      </span>
                    ) : (
                      <span className="cursor-pointer hover:bg-muted/20 px-2 py-1 rounded text-muted-foreground/50 text-xs">
                        —
                      </span>
                    )}
                  </td>
                  <td
                    className="p-1 h-14 align-middle leading-none text-center"
                    onClick={() => startEditing(task.id, "context")}
                  >
                    {editingTask === task.id && editingField === "context" ? (
                      <Select
                        defaultValue={task.context || "none"}
                        onValueChange={(value: string) => {
                          handleEditTask(task.id, "context", value);
                          stopEditing();
                        }}
                      >
                        <SelectTrigger className="w-24 h-5 border-none shadow-none focus:ring-0 bg-transparent text-xs px-2 py-0 text-center mx-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">—</SelectItem>
                          <SelectItem value="HOME">@home</SelectItem>
                          <SelectItem value="COMPUTER">@computer</SelectItem>
                          <SelectItem value="CALLS">@calls</SelectItem>
                          <SelectItem value="ERRANDS">@errands</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : task.context ? (
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full border cursor-pointer hover:opacity-80 transition-opacity ${getContextColor(
                          task.context
                        )}`}
                      >
                        {task.context === 'HOME' ? '@home' : 
                         task.context === 'COMPUTER' ? '@computer' :
                         task.context === 'CALLS' ? '@calls' :
                         task.context === 'ERRANDS' ? '@errands' : task.context}
                      </span>
                    ) : (
                      <span className="cursor-pointer hover:bg-muted/20 px-2 py-1 rounded text-muted-foreground/50 text-xs">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {isAddingTask && (
                <tr ref={addTaskRowRef} className="border-b-0 bg-muted/20">
                  <td className="p-1 h-14 align-middle leading-none text-center">
                    <div className="w-4 h-4 rounded-sm border-2 border-dashed border-muted-foreground/40 mx-auto"></div>
                  </td>
                  <td className="p-1 h-14 align-middle leading-none text-center">
                    <div className="w-6 h-6 rounded border border-dashed border-muted-foreground/40 flex items-center justify-center mx-auto">
                      <FileText className="h-3 w-3 text-muted-foreground/40" />
                    </div>
                  </td>
                  <td className="p-1 h-14 align-middle leading-none w-48">
                    <Input
                      placeholder="Enter task name..."
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="border border-border/40 shadow-none focus-visible:ring-0 focus-visible:border-ring px-2 py-2 bg-transparent placeholder:text-muted-foreground/60 h-8 w-full rounded-md"
                      autoFocus
                    />
                  </td>
                  <td className="p-1 h-14 align-middle leading-none">
                    <Input
                      type="date"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="relative border border-border/40 shadow-none focus-visible:ring-0 focus-visible:border-ring px-2 py-2 w-32 bg-transparent text-sm h-8 rounded-md [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2"
                      placeholder="Optional"
                    />
                  </td>
                  <td className="p-1 h-14 align-middle leading-none text-center">
                    <Select
                      value={newTaskPriority || "none"}
                      onValueChange={(value) => setNewTaskPriority(value === "none" ? null : value as Priority)}
                    >
                      <SelectTrigger className="w-16 h-5 border-none shadow-none focus:ring-0 bg-transparent text-xs px-2 py-0 text-center mx-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">—</SelectItem>
                        <SelectItem value="P1">P1</SelectItem>
                        <SelectItem value="P2">P2</SelectItem>
                        <SelectItem value="P3">P3</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-1 h-14 align-middle leading-none text-center">
                    <Select
                      value={newTaskEnergy || "none"}
                      onValueChange={(value) => setNewTaskEnergy(value === "none" ? null : value as Energy)}
                    >
                      <SelectTrigger className="w-20 h-5 border-none shadow-none focus:ring-0 bg-transparent text-xs px-2 py-0 text-center mx-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">—</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-1 h-14 align-middle leading-none text-center">
                    <Select
                      value={newTaskContext || "none"}
                      onValueChange={(value) => setNewTaskContext(value === "none" ? null : value as Context)}
                    >
                      <SelectTrigger className="w-24 h-5 border-none shadow-none focus:ring-0 bg-transparent text-xs px-2 py-0 text-center mx-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">—</SelectItem>
                        <SelectItem value="@home">@home</SelectItem>
                        <SelectItem value="@computer">@computer</SelectItem>
                        <SelectItem value="@calls">@calls</SelectItem>
                        <SelectItem value="@errands">@errands</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Sleek Add Task Button */}
          {!isAddingTask && (
            <div
              className="
                mt-3 p-1 rounded-lg border-2 border-dashed border-muted-foreground/15 
                hover:border-primary/40 hover:bg-primary/5 
                transition-all duration-300 cursor-pointer group
              "
              onClick={() => setIsAddingTask(true)}
            >
              <div className="flex items-center justify-center gapx-2 py-1 text-muted-foreground/60 group-hover:text-primary transition-colors duration-300">
                <Plus className="h-4 w-4" />
                <span className="text-sm font-medium">Add Task</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
