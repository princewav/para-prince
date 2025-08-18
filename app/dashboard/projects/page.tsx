import { Button } from "@/components/ui/button";

export default function ProjectsPage() {
  const projects = [
    {
      id: 1,
      name: "Project Alpha",
      dueDate: "2025-09-15",
      status: "In Progress",
      priority: "High",
    },
    {
      id: 2,
      name: "Project Beta",
      dueDate: "2025-10-01",
      status: "Pending",
      priority: "Medium",
    },
    {
      id: 3,
      name: "Project Gamma",
      dueDate: "2025-08-20",
      status: "Completed",
      priority: "Low",
    },
  ];

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
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-b last:border-b-0">
                <td className="p-4">{project.name}</td>
                <td className="p-4">{project.dueDate}</td>
                <td className="p-4">{project.status}</td>
                <td className="p-4">{project.priority}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}