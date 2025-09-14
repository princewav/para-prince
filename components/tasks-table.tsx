"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, Flag, Plus, FileText, Check, List, Zap, MapPin, Target, MoreHorizontal, Trash2, Copy } from "lucide-react";
import { StarButton } from "@/components/star-button";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { tasksApi } from "@/lib/api";
import { TaskWithRelations, Priority, Energy, Context } from "@/lib/types";
import { getPriorityColor, getEnergyColor, getContextColor } from "@/lib/badge-utils";
import { capitalize } from "@/lib/utils";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";

interface TasksTableProps {
  projectId?: number;
  areaId?: number;
  title?: string;
  showProjectColumn?: boolean;
}

export function TasksTable({ projectId, areaId, title = "Tasks", showProjectColumn = false }: TasksTableProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<Priority | "none" | null>(null);
  const [newTaskEnergy, setNewTaskEnergy] = useState<Energy | "none" | null>(null);
  const [newTaskContext, setNewTaskContext] = useState<Context | "none" | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const addTaskRowRef = useRef<HTMLTableRowElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TaskWithRelations | null>(null);

  const sortTasks = (tasksToSort: TaskWithRelations[]) => {
    const priorityOrder: Record<Priority, number> = { P1: 1, P2: 2, P3: 3 };
    return [...tasksToSort].sort((a, b) => {
      // Always sort completed tasks to the bottom
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      
      // For non-completed tasks or both completed, sort by priority first
      const aPriority = a.priority ? priorityOrder[a.priority] || 5 : 5;
      const bPriority = b.priority ? priorityOrder[b.priority] || 5 : 5;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // Then sort by due date
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: { projectId?: number; areaId?: number } = {};
      if (projectId) params.projectId = projectId;
      if (areaId) params.areaId = areaId;
      
      const data = await tasksApi.getAll(params);
      setTasks(sortTasks(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [projectId, areaId]);

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
          name: capitalize(newTaskName),
          dueDate: newTaskDueDate || null,
          priority: newTaskPriority === "none" ? null : newTaskPriority,
          energy: newTaskEnergy === "none" ? null : newTaskEnergy,
          context: newTaskContext === "none" ? null : newTaskContext,
          projectId: projectId || null,
          areaId: areaId || null,
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

    // Optimistic update - immediately update the UI
    const optimisticTask = { ...task, completed: !task.completed };
    const optimisticTasks = tasks.map((t) => t.id === taskId ? optimisticTask : t);
    setTasks(sortTasks(optimisticTasks));

    try {
      const updatedTask = await tasksApi.toggleComplete(taskId, !task.completed);
      // Update with the actual response from server and resort
      const updatedTasks = tasks.map((t) => t.id === taskId ? updatedTask : t);
      setTasks(sortTasks(updatedTasks));
    } catch (err) {
      console.error('Failed to toggle task:', err);
      // Revert optimistic update on error
      setTasks(tasks);
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
        updateData[field] = field === 'name' ? capitalize(value) : value;
      }

      const updatedTask = await tasksApi.update(taskId, updateData);
      const updatedTasks = tasks.map((task) => task.id === taskId ? updatedTask : task);
      
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

  const getDaysLeft = (dueDate: string) => {
    if (!dueDate) return null;
    
    const today = new Date('2025-09-08');
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
      return 'text-destructive font-medium';
    } else if (daysLeft === 0) {
      return 'text-amber-600 font-medium';
    } else if (daysLeft <= 3) {
      return 'text-amber-700';
    }
    
    return '';
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      
      // Remove task from state
      setTasks(tasks.filter(task => task.id !== taskId));
      setTaskToDelete(null);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const openDeleteDialog = (task: TaskWithRelations) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleDuplicateTask = async (task: TaskWithRelations) => {
    try {
      const duplicatedTask = {
        name: `${task.name} (Copy)`,
        description: task.description,
        status: task.status,
        priority: task.priority,
        energy: task.energy,
        context: task.context,
        notes: task.notes,
        dueDate: task.dueDate,
        projectId: task.projectId,
        areaId: task.areaId,
      };

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(duplicatedTask),
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate task');
      }

      const newTask = await response.json();
      setTasks([...tasks, newTask]);
    } catch (err) {
      console.error('Failed to duplicate task:', err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">Loading tasks...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">Error: {error}</div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>

      <Card className="pt-2">
        <CardContent>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="px-3 py-2 font-medium w-4 text-center" title="Completed">
                  <div className="flex items-center justify-center">
                    <Check className="h-4 w-4 text-muted-foreground" />
                  </div>
                </th>
                <th className="px-3 py-2 font-medium w-4 text-center" title="Notes">
                  <div className="flex items-center justify-center">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                </th>
                <th className="px-3 py-2 font-medium w-48" title="Task Name">
                  <div className="flex items-center">
                    <List className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Task</span>
                  </div>
                </th>
                {showProjectColumn && (
                  <th className="px-3 py-2 font-medium w-32" title="Project">
                    <div className="flex items-center">
                      <Target className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Project</span>
                    </div>
                  </th>
                )}
                <th className="px-3 py-2 font-medium w-32" title="Due Date">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                </th>
                <th className="px-3 py-2 font-medium w-8 text-center" title="Priority">
                  <div className="flex items-center justify-center">
                    <Flag className="h-4 w-4 text-muted-foreground" />
                  </div>
                </th>
                <th className="px-3 py-2 font-medium w-12 text-center" title="Energy">
                  <div className="flex items-center justify-center">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </div>
                </th>
                <th className="px-3 py-2 font-medium w-20 text-center" title="Context">
                  <div className="flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                </th>
                <th className="px-3 py-2 font-medium w-12 text-center" title="Actions">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b last:border-b-0 h-10">
                  <td className="p-1 align-middle leading-none text-center">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleToggleTask(task.id)}
                    />
                  </td>
                  <td className="p-1 align-middle leading-none text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-muted/50"
                      title="View Notes"
                      onClick={(e) => {
                        e.stopPropagation();
                        const baseUrl = projectId 
                          ? `/dashboard/projects/${projectId}/tasks/${task.id}/notes`
                          : `/dashboard/tasks/${task.id}/notes`;
                        router.push(baseUrl);
                      }}
                    >
                      <FileText className={`h-3 w-3 ${task.notes && task.notes.trim() ? 'text-foreground' : 'text-muted-foreground/50'}`} />
                    </Button>
                  </td>
                  <td
                    className={`p-1 align-middle leading-none w-48 ${
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
                      <div className="cursor-pointer hover:bg-muted/20 px-2 py-1 rounded  w-full overflow-hidden rounded-sm">
                        <span className="block truncate py-1 " title={task.name}>
                          {task.name}
                        </span>
                      </div>
                    )}
                  </td>
                  {showProjectColumn && (
                    <td className="p-1 align-middle leading-none">
                      {task.project ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/projects/${task.project?.id}`);
                          }}
                          className="text-sm text-left cursor-pointer hover:bg-muted/20 px-2 py-1 rounded  w-full hover:underline"
                        >
                          {task.project.name}
                        </button>
                      ) : (
                        <span className="text-sm text-muted-foreground px-2">
                          No project
                        </span>
                      )}
                    </td>
                  )}
                  <td
                    className={`p-1 align-middle leading-none ${
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
                      <span className="cursor-pointer hover:bg-muted/20 px-2 py-1 rounded ">
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
                    className="p-1 align-middle leading-none text-center"
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
                    className="p-1 align-middle leading-none text-center"
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
                    className="p-1 align-middle leading-none text-center"
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
                  <td className="p-1 align-middle leading-none">
                    <div className="flex items-center justify-center gap-1">
                      <StarButton 
                        itemId={task.id}
                        itemType="TASK"
                        size="sm"
                        className="h-6 w-6"
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-muted"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateTask(task);
                          }}
                          className="cursor-pointer"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate Task
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteDialog(task);
                          }}
                          className="text-destructive focus:text-destructive cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
              {isAddingTask && (
                <tr ref={addTaskRowRef} className="border-b-0 bg-muted/20">
                  <td className="p-1 align-middle leading-none text-center">
                    <div className="w-4 h-4 rounded-sm border-2 border-dashed border-muted-foreground/40 mx-auto"></div>
                  </td>
                  <td className="p-1 align-middle leading-none text-center">
                    <div className="w-6 h-6 rounded border border-dashed border-muted-foreground/40 flex items-center justify-center mx-auto">
                      <FileText className="h-3 w-3 text-muted-foreground/40" />
                    </div>
                  </td>
                  <td className="p-1 align-middle leading-none w-48">
                    <Input
                      placeholder="Enter task name..."
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="border border-border/40 shadow-none focus-visible:ring-0 focus-visible:border-ring px-2 py-2 bg-transparent placeholder:text-muted-foreground/60 h-8 w-full rounded-md"
                      autoFocus
                    />
                  </td>
                  {showProjectColumn && (
                    <td className="p-1 align-middle leading-none">
                      <span className="text-sm text-muted-foreground">—</span>
                    </td>
                  )}
                  <td className="p-1 align-middle leading-none">
                    <Input
                      type="date"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="relative border border-border/40 shadow-none focus-visible:ring-0 focus-visible:border-ring px-2 py-2 w-32 bg-transparent text-sm h-8 rounded-md [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2"
                      placeholder="Optional"
                    />
                  </td>
                  <td className="p-1 align-middle leading-none text-center">
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
                  <td className="p-1 align-middle leading-none text-center">
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
                  <td className="p-1 align-middle leading-none text-center">
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
                  <td className="p-1 align-middle leading-none text-center">
                    <div className="w-8 h-8"></div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

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

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => taskToDelete && handleDeleteTask(taskToDelete.id)}
        title="Delete Task"
        description="Are you sure you want to delete this task?"
        itemName={taskToDelete?.name || ''}
      />
    </div>
  );
}
