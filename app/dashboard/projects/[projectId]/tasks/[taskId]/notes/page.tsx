"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Card as CardVariant,
  CardContent as CardContentVariant,
} from "@/components/ui/card-variant";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calendar, AlertCircle, Flag, Zap, MapPin, FileText } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function TaskNotesPage() {
  const router = useRouter();
  const params = useParams();
  const { projectId, taskId } = params;

  const [notes, setNotes] = useState("");
  const [originalNotes, setOriginalNotes] = useState("");
  const [task, setTask] = useState<any>(null);
  
  const hasChanges = notes !== originalNotes;

  // Mock data - replace with actual API call
  useEffect(() => {
    // Simulate fetching task data
    const mockTasks = [
      { id: 1, name: "Overdue Task", dueDate: "2025-09-05", completed: false, priority: "P2", energy: "High", context: "@computer", notes: "Some existing notes about this task..." },
      { id: 2, name: "Due Today", dueDate: "2025-09-08", completed: false, priority: "P1", energy: "Medium", context: "@calls", notes: "" },
      { id: 3, name: "No Due Date", dueDate: "", completed: false, priority: null, energy: "Low", context: "@home", notes: "Initial thoughts on this task" },
      { id: 4, name: "Due Tomorrow", dueDate: "2025-09-09", completed: false, priority: "P1", energy: "High", context: "@errands", notes: "" },
      { id: 5, name: "Due Soon", dueDate: "2025-09-11", completed: false, priority: "P2", energy: "Medium", context: "@computer", notes: "" },
      { id: 6, name: "Future Task", dueDate: "2025-09-20", completed: false, priority: "P3", energy: "Low", context: "@home", notes: "" },
      { id: 7, name: "Very Overdue", dueDate: "2025-08-25", completed: true, priority: "P1", energy: "High", context: "@calls", notes: "Completed with some challenges" },
    ];

    const currentTask = mockTasks.find(t => t.id === parseInt(taskId as string));
    if (currentTask) {
      setTask(currentTask);
      setNotes(currentTask.notes);
      setOriginalNotes(currentTask.notes);
    }
  }, [taskId]);

  const handleSave = () => {
    // TODO: Save to database
    console.log("Saving notes:", notes);
    
    // Update the mock task data (in real app, this would be API call)
    if (task) {
      task.notes = notes;
    }
    
    // Navigate back to project page
    router.push(`/dashboard/projects/${projectId}`);
  };

  const handleCancel = () => {
    // Reset notes to original value
    setNotes(originalNotes);
    router.back();
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "P1":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
      case "P2":
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
      case "P3":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
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
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800";
    }
  };

  if (!task) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <div className="ml-4 flex items-center gap-2">
          <FileText className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold">Task Notes</h1>
        </div>
      </div>

      <div className="mb-4">
        <CardVariant padding="sm" className="p-4">
          <CardContentVariant padding="sm" className="">
            <div className="mb-3">
              <h2 className="text-xl font-semibold">{task.name}</h2>
            </div>
            <div className="flex items-center gap-6 mb-2 mt-1">
              {task.dueDate && (
                <div className="flex items-center gap-2 py-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{task.dueDate}</span>
                </div>
              )}
              {task.priority && (
                <div className="flex items-center gap-2 py-1">
                  <Flag className="h-4 w-4 text-muted-foreground" />
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              )}
              {task.energy && (
                <div className="flex items-center gap-2 py-1">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getEnergyColor(task.energy)}`}>
                    {task.energy}
                  </span>
                </div>
              )}
              {task.context && (
                <div className="flex items-center gap-2 py-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getContextColor(task.context)}`}>
                    {task.context}
                  </span>
                </div>
              )}
            </div>
          </CardContentVariant>
        </CardVariant>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add your notes here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[300px] resize-none"
          />
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSave} disabled={!hasChanges}>
              {hasChanges ? "Save Changes" : "Saved"}
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}