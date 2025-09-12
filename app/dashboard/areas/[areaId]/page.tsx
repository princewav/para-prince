"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { areasApi } from "@/lib/api";
import { AreaWithTasks, Priority } from "@/lib/types";
import { AreaInfoCard } from "@/components/area-info-card";
import { ProjectsTable } from "@/components/projects-table";
import { TasksTable } from "@/components/tasks-table";
import { capitalize } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface AreaWithProjects extends AreaWithTasks {
  projects: Array<{
    id: number;
    name: string;
    description?: string;
    status: string;
    priority?: Priority;
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
    _count?: {
      tasks: number;
    };
  }>;
  _count: {
    tasks: number;
    projects: number;
  };
}

export default function AreaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { areaId } = params;

  const [area, setArea] = useState<AreaWithProjects | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingArea, setEditingArea] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);

  const loadAreaData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const areaData = await areasApi.getById(parseInt(areaId as string));
      setArea(areaData as AreaWithProjects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load area');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (areaId) {
      loadAreaData();
    }
  }, [areaId]);

  const handleEditArea = async (field: string, value: string | null) => {
    if (!area) return;
    
    try {
      let updateData: any = {};
      
      if (field === 'priority') {
        updateData.priority = value as Priority;
      } else {
        updateData[field] = field === 'name' ? capitalize(value || '') : value;
      }

      const updatedArea = await areasApi.update(area.id, updateData);
      setArea(updatedArea as AreaWithProjects);
    } catch (err) {
      console.error('Failed to update area:', err);
    }
  };

  const startEditingArea = (field: string) => {
    setEditingArea(true);
    setEditingField(field);
  };

  const stopEditingArea = () => {
    setEditingArea(false);
    setEditingField(null);
  };

  const handleAreaKeyPress = (e: React.KeyboardEvent, field: string, value: string) => {
    if (e.key === 'Enter') {
      handleEditArea(field, value);
      stopEditingArea();
    } else if (e.key === 'Escape') {
      stopEditingArea();
    }
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

  if (!area) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft />
          </Button>
          <h1 className="text-3xl font-bold ml-4">Area not found</h1>
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
        <div className="flex-1 ml-4" onClick={() => !editingArea && startEditingArea('name')}>
          {editingArea && editingField === 'name' ? (
            <Input
              defaultValue={area.name}
              onBlur={(e) => {
                handleEditArea('name', e.target.value);
                stopEditingArea();
              }}
              onKeyDown={(e) => handleAreaKeyPress(e, 'name', (e.target as HTMLInputElement).value)}
              className="text-3xl font-bold border border-border/40 shadow-none focus-visible:ring-0 focus-visible:border-ring px-3 py-2 bg-transparent h-auto rounded-md"
              autoFocus
            />
          ) : (
            <h1 className="text-3xl font-bold cursor-pointer hover:bg-muted/20 px-3 py-2 rounded -mx-3 -my-2">
              {area.name}
            </h1>
          )}
        </div>
        <div className="ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingArea(!editingArea)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-4 w-4 mr-2" />
            {editingArea ? 'Done' : 'Edit'}
          </Button>
        </div>
      </div>

      {/* Area Info Card with Stats */}
      <AreaInfoCard 
        area={area} 
        onUpdate={handleEditArea}
        stats={{
          projects: area._count.projects,
          tasks: area._count.tasks,
          resources: area.resources?.length || 0
        }}
      />

      {/* Projects Table */}
      <div className="mb-8">
        <ProjectsTable 
          areaId={area.id} 
          onProjectAdded={loadAreaData}
        />
      </div>

      {/* Tasks Table */}
      <div className="mb-8">
        <TasksTable 
          areaId={area.id}
          title="Quick Tasks"
        />
      </div>
    </div>
  );
}