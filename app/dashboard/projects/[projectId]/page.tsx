"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams();
  const { projectId } = params;

  const [tasks, setTasks] = useState([
    { id: 1, name: "Task 1", dueDate: "2025-08-25", status: "Pending" },
    { id: 2, name: "Task 2", dueDate: "2025-09-01", status: "In Progress" },
  ]);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");

  const handleAddTask = () => {
    if (newTaskName && newTaskDueDate) {
      setTasks([
        ...tasks,
        {
          id: tasks.length + 1,
          name: newTaskName,
          dueDate: newTaskDueDate,
          status: "Pending",
        },
      ]);
      setNewTaskName("");
      setNewTaskDueDate("");
    }
  };

  // In a real application, you would fetch the project data based on the projectId.
  const project = {
    id: projectId,
    name: `Project ${projectId}`,
    dueDate: "2025-09-15",
    status: "In Progress",
    priority: "High",
    description: "This is a detailed description of the project. It includes the project goals, scope, and other relevant information.",
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="text-3xl font-bold ml-4">{project.name}</h1>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-4">
                <Input
                  placeholder="Task Name"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                />
                <Input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                />
                <Button onClick={handleAddTask}>Add Task</Button>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 font-medium">Task Name</th>
                    <th className="p-4 font-medium">Due Date</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id} className="border-b last:border-b-0">
                      <td className="p-4">{task.name}</td>
                      <td className="p-4">{task.dueDate}</td>
                      <td className="p-4">{task.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <p className="font-medium">Due Date</p>
                <p>{project.dueDate}</p>
              </div>
              <div className="mt-4">
                <p className="font-medium">Status</p>
                <p>{project.status}</p>
              </div>
              <div className="mt-4">
                <p className="font-medium">Priority</p>
                <p>{project.priority}</p>
              </div>
              <div className="mt-4">
                <p className="font-medium">Description</p>
                <p>{project.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
