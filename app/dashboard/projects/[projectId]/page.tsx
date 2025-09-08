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
import { ArrowLeft, Calendar, AlertCircle, Flag, Plus } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams();
  const { projectId } = params;

  const [tasks, setTasks] = useState([
    { id: 1, name: "Overdue Task", dueDate: "2025-09-05", completed: false, priority: "P2" as string | null },
    { id: 2, name: "Due Today", dueDate: "2025-09-08", completed: false, priority: "P1" as string | null },
    { id: 3, name: "No Due Date", dueDate: "", completed: false, priority: null },
    { id: 4, name: "Due Tomorrow", dueDate: "2025-09-09", completed: false, priority: "P1" as string | null },
    { id: 5, name: "Due Soon", dueDate: "2025-09-11", completed: false, priority: "P2" as string | null },
    { id: 6, name: "Future Task", dueDate: "2025-09-20", completed: false, priority: "P3" as string | null },
    { id: 7, name: "Very Overdue", dueDate: "2025-08-25", completed: true, priority: "P1" as string | null },
  ]);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<string | null>("P3");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);

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

  const handleAddTask = () => {
    if (newTaskName) {
      const newTask = {
        id: tasks.length + 1,
        name: newTaskName,
        dueDate: newTaskDueDate || "",
        priority: newTaskPriority === "none" ? null : newTaskPriority,
        completed: false,
      };
      
      const updatedTasks = [...tasks, newTask];
      setTasks(sortTasks(updatedTasks));
      
      setNewTaskName("");
      setNewTaskDueDate("");
      setNewTaskPriority("P3");
      setIsAddingTask(false);
    }
  };

  const handleCancelAdd = () => {
    setNewTaskName("");
    setNewTaskDueDate("");
    setNewTaskPriority("P3");
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
              <div className="flex items-center gapx-2 py-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{project.dueDate}</span>
              </div>
              <div className="flex items-center gapx-2 py-1">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{project.status}</span>
              </div>
              <div className="flex items-center gapx-2 py-1">
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
                <th className="px-3 py-2 font-medium w-12">Done</th>
                <th className="px-3 py-2 font-medium">Task Name</th>
                <th className="px-3 py-2 font-medium">Due Date</th>
                <th className="px-3 py-2 font-medium w-20">Priority</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b last:border-b-0">
                  <td className="px-3 py-2 h-10 align-middle leading-none">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={(checked) => handleToggleTask(task.id)}
                    />
                  </td>
                  <td
                    className={`px-3 py-2 h-10 align-middle leading-none ${
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
                        className="border-none shadow-none focus-visible:ring-0 px-2 py-0 bg-transparent h-5 w-full min-w-0"
                        autoFocus
                      />
                    ) : (
                      <span className="cursor-pointer hover:bg-muted/20 px-2 py-1 rounded -mx-2 -my-1">
                        {task.name}
                      </span>
                    )}
                  </td>
                  <td
                    className={`px-3 py-2 h-10 align-middle leading-none ${
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
                        className="border-none shadow-none focus-visible:ring-0 px-2 py-0 bg-transparent h-5 w-36 min-w-0"
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
                    className="px-3 py-2 h-10 align-middle leading-none"
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
                        <SelectTrigger className="w-16 h-5 border-none shadow-none focus:ring-0 bg-transparent text-xs px-2 py-0">
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
                </tr>
              ))}
              {isAddingTask && (
                <tr className="border-b-0 bg-muted/20">
                  <td className="px-3 py-2 h-10 align-middle leading-none">
                    <div className="w-4 h-4 rounded-sm border-2 border-dashed border-muted-foreground/40"></div>
                  </td>
                  <td className="px-3 py-2 h-10 align-middle leading-none">
                    <Input
                      placeholder="Enter task name..."
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="border-none shadow-none focus-visible:ring-0 px-2 py-0 bg-transparent placeholder:text-muted-foreground/60 h-5"
                      autoFocus
                    />
                  </td>
                  <td className="px-3 py-2 h-10 align-middle leading-none">
                    <Input
                      type="date"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="border-none shadow-none focus-visible:ring-0 px-2 py-0 w-32 bg-transparent text-sm h-5"
                      placeholder="Optional"
                    />
                  </td>
                  <td className="px-3 py-2 h-10 align-middle leading-none">
                    <div className="flex gapx-2 py-1 items-center">
                      <Select
                        value={newTaskPriority}
                        onValueChange={setNewTaskPriority}
                      >
                        <SelectTrigger className="w-16 h-5 border-none shadow-none focus:ring-0 bg-transparent text-xs px-2 py-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">—</SelectItem>
                          <SelectItem value="P1">P1</SelectItem>
                          <SelectItem value="P2">P2</SelectItem>
                          <SelectItem value="P3">P3</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        onClick={handleAddTask}
                        disabled={!newTaskName}
                        className="h-7 px-3"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelAdd}
                        className="h-7 px-3 text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </Button>
                    </div>
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
