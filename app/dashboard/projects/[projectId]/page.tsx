"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Card as CardVariant,
  CardContent as CardContentVariant,
} from "@/components/ui/card-variant";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, AlertCircle, Flag, Plus, FileText, Check, List, Zap, MapPin } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams();
  const { projectId } = params;

  const [tasks, setTasks] = useState([
    { id: 1, name: "Overdue Task", dueDate: "2025-09-05", completed: false, priority: "P2" as string | null, energy: "High" as string | null, context: "@computer" as string | null, notes: "This task is overdue and needs immediate attention. The client has been asking for updates." },
    { id: 2, name: "Due Today", dueDate: "2025-09-08", completed: false, priority: "P1" as string | null, energy: "Medium" as string | null, context: "@calls" as string | null, notes: "" },
    { id: 3, name: "No Due Date", dueDate: "", completed: false, priority: null, energy: "Low" as string | null, context: "@home" as string | null, notes: "Research task for future planning. No urgency but good to explore when time allows." },
    { id: 4, name: "Due Tomorrow", dueDate: "2025-09-09", completed: false, priority: "P1" as string | null, energy: "High" as string | null, context: "@errands" as string | null, notes: "" },
    { id: 5, name: "Due Soon", dueDate: "2025-09-11", completed: false, priority: "P2" as string | null, energy: "Medium" as string | null, context: "@computer" as string | null, notes: "" },
    { id: 6, name: "Future Task", dueDate: "2025-09-20", completed: false, priority: "P3" as string | null, energy: "Low" as string | null, context: "@home" as string | null, notes: "" },
    { id: 7, name: "Very Overdue", dueDate: "2025-08-25", completed: true, priority: "P1" as string | null, energy: "High" as string | null, context: "@calls" as string | null, notes: "Completed successfully despite the delays. Lessons learned for future similar tasks." },
  ]);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<string | null>(null);
  const [newTaskEnergy, setNewTaskEnergy] = useState<string | null>(null);
  const [newTaskContext, setNewTaskContext] = useState<string | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const addTaskRowRef = useRef<HTMLTableRowElement>(null);

  const sortTasks = (tasksToSort: typeof tasks) => {
    const priorityOrder: Record<string, number> = { P1: 1, P2: 2, P3: 3 };
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

  // Sort tasks by priority and due date on mount
  useEffect(() => {
    setTasks(currentTasks => sortTasks(currentTasks));
  }, []);

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

  const handleAddTask = () => {
    if (newTaskName) {
      const newTask = {
        id: tasks.length + 1,
        name: newTaskName,
        dueDate: newTaskDueDate || "",
        priority: newTaskPriority === "none" ? null : newTaskPriority,
        energy: newTaskEnergy === "none" ? null : newTaskEnergy,
        context: newTaskContext === "none" ? null : newTaskContext,
        notes: "",
        completed: false,
      };
      
      const updatedTasks = [...tasks, newTask];
      setTasks(sortTasks(updatedTasks));
      
      setNewTaskName("");
      setNewTaskDueDate("");
      setNewTaskPriority(null);
      setNewTaskEnergy(null);
      setNewTaskContext(null);
      setIsAddingTask(false);
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

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "P1":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
      case "P2":
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
      case "P3":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
      case null:
        return "bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800";
    }
  };

  const getEnergyColor = (energy: string | null) => {
    switch (energy) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
      case "Medium":
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
      case "Low":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
      case null:
        return "bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800";
    }
  };

  const getContextColor = (context: string | null) => {
    switch (context) {
      case "@home":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
      case "@computer":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
      case "@calls":
        return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800";
      case "@errands":
        return "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800";
      case null:
        return "bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTaskName) {
      handleAddTask();
    } else if (e.key === 'Escape') {
      handleCancelAdd();
    }
  };

  const handleToggleTask = (taskId: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleEditTask = (taskId: number, field: string, value: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { 
        ...task, 
        [field]: field === 'priority' && value === 'none' ? null : value 
      } : task
    );
    
    // Resort if priority or due date changed
    if (field === 'priority' || field === 'dueDate') {
      setTasks(sortTasks(updatedTasks));
    } else {
      setTasks(updatedTasks);
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

  // In a real application, you would fetch the project data based on the projectId.
  const project = {
    id: projectId,
    name: `Project ${projectId}`,
    dueDate: "2025-09-15",
    status: "In Progress",
    priority: "High",
    description:
      "This is a detailed description of the project. It includes the project goals, scope, and other relevant information.",
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="text-3xl font-bold ml-4">{project.name}</h1>
      </div>

      <div className="mb-4">
        <CardVariant padding="sm" className="p-4">
          <CardContentVariant padding="sm" className="">
            <div className="flex items-center gap-6 mb-2 mt-1">
              <div className="flex items-center gap-2 py-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{project.dueDate}</span>
              </div>
              <div className="flex items-center gap-2 py-1">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{project.status}</span>
              </div>
              <div className="flex items-center gap-2 py-1">
                <Flag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{project.priority}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {project.description}
            </p>
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
                        defaultValue={task.dueDate}
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
                          <span className={getDueDateClass(task.dueDate)}>
                            <span>{task.dueDate}</span>
                            <span className="text-xs ml-1 opacity-75">
                              {formatDaysLeft(getDaysLeft(task.dueDate))}
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
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : task.energy ? (
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full border cursor-pointer hover:opacity-80 transition-opacity ${getEnergyColor(
                          task.energy
                        )}`}
                      >
                        {task.energy}
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
                          <SelectItem value="@home">@home</SelectItem>
                          <SelectItem value="@computer">@computer</SelectItem>
                          <SelectItem value="@calls">@calls</SelectItem>
                          <SelectItem value="@errands">@errands</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : task.context ? (
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full border cursor-pointer hover:opacity-80 transition-opacity ${getContextColor(
                          task.context
                        )}`}
                      >
                        {task.context}
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
                      onValueChange={(value) => setNewTaskPriority(value === "none" ? null : value)}
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
                      onValueChange={(value) => setNewTaskEnergy(value === "none" ? null : value)}
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
                      onValueChange={(value) => setNewTaskContext(value === "none" ? null : value)}
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
