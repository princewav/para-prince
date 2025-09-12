"use client";

import { Button } from "@/components/ui/button";
import {
  Card as CardVariant,
  CardContent as CardContentVariant,
} from "@/components/ui/card-variant";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AreaCombobox } from "@/components/area-combobox";
import { TasksTable } from "@/components/tasks-table";
import { ArrowLeft, Calendar, AlertCircle, Flag, Edit, ExternalLink, MapPin } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { projectsApi, areasApi } from "@/lib/api";
import { ProjectWithTasks, Priority, ProjectStatus, AreaWithTasks } from "@/lib/types";
import { getPriorityColor, getProjectStatusColor } from "@/lib/badge-utils";
import { capitalize } from "@/lib/utils";

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams();
  const { projectId } = params;

  const [project, setProject] = useState<ProjectWithTasks | null>(null);
  const [areas, setAreas] = useState<AreaWithTasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState(false);
  const [editingProjectField, setEditingProjectField] = useState<string | null>(null);

  // Load project and areas on mount
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
        updateData[field] = field === 'name' ? capitalize(value || '') : value;
      }

      const updatedProject = await projectsApi.update(project.id, updateData);
      // Preserve existing area if it wasn't being updated
      if (field !== 'areaId' && project.area && !updatedProject.area) {
        updatedProject.area = project.area;
      }
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
                      value={project.area?.id?.toString() || ''}
                      onValueChange={(value) => {
                        handleEditProject('areaId', value);
                        setEditingProjectField(null);
                      }}
                      onCreateArea={handleCreateArea as any}
                      placeholder="Select area..."
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <span 
                      className="text-sm font-medium cursor-pointer hover:bg-muted/20 px-1 py-0.5 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProjectField('areaId');
                      }}
                    >
                      {project.area?.name || 'No area'}
                    </span>
                    {project.area && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-muted/50 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/areas/${project.area?.id}`);
                        }}
                        title="View Area Details"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
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

      <TasksTable 
        projectId={parseInt(projectId as string)}
        title="Project Tasks"
      />
    </div>
  );
}
