"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MapPin, FolderOpen, CheckSquare, FileText, Flag, MoreHorizontal, Copy, Archive, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Priority } from "@/lib/types";
import { getPriorityColor } from "@/lib/badge-utils";
import { AddAreaDialog } from "@/components/add-area-dialog";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";

interface Area {
  id: number;
  name: string;
  description?: string;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  projects: any[];
  tasks: any[];
  resources: any[];
  _count: {
    projects: number;
    tasks: number;
    resources: number;
  };
}

export default function AreasPage() {
  const router = useRouter();
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<Area | null>(null);
  const [deleteAction, setDeleteAction] = useState<'archive' | 'delete'>('archive');

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/areas');
      if (!response.ok) throw new Error('Failed to fetch areas');
      const data = await response.json();
      setAreas(data);
    } catch (error) {
      console.error('Error fetching areas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);


  const getAreaInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAreaColor = (index: number) => {
    const colors = [
      "bg-gradient-to-br from-blue-400 to-blue-600",
      "bg-gradient-to-br from-green-400 to-green-600", 
      "bg-gradient-to-br from-purple-400 to-purple-600",
      "bg-gradient-to-br from-orange-400 to-orange-600",
      "bg-gradient-to-br from-pink-400 to-pink-600",
      "bg-gradient-to-br from-indigo-400 to-indigo-600",
      "bg-gradient-to-br from-teal-400 to-teal-600",
      "bg-gradient-to-br from-red-400 to-red-600",
    ];
    return colors[index % colors.length];
  };

  const handleAreaClick = (areaId: number) => {
    router.push(`/dashboard/areas/${areaId}`);
  };

  const handleArchiveArea = async (areaId: number) => {
    try {
      const response = await fetch(`/api/areas/${areaId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to archive area');
      }
      
      // Remove area from state
      setAreas(areas.filter(area => area.id !== areaId));
      setAreaToDelete(null);
    } catch (err) {
      console.error('Failed to archive area:', err);
    }
  };

  const handleDeleteArea = async (areaId: number) => {
    try {
      const response = await fetch(`/api/areas/${areaId}?force=true`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete area');
      }
      
      // Remove area from state
      setAreas(areas.filter(area => area.id !== areaId));
      setAreaToDelete(null);
    } catch (err) {
      console.error('Failed to delete area:', err);
    }
  };

  const openArchiveDialog = (area: Area) => {
    setAreaToDelete(area);
    setDeleteAction('archive');
    setDeleteDialogOpen(true);
  };

  const openDeleteDialog = (area: Area) => {
    setAreaToDelete(area);
    setDeleteAction('delete');
    setDeleteDialogOpen(true);
  };

  const handleDuplicateArea = async (area: Area) => {
    try {
      const duplicatedArea = {
        name: `${area.name} (Copy)`,
        description: area.description,
        priority: area.priority,
      };

      const response = await fetch('/api/areas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(duplicatedArea),
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate area');
      }

      const newArea = await response.json();
      setAreas([...areas, newArea]);
    } catch (err) {
      console.error('Failed to duplicate area:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Areas</h1>
            <p className="text-muted-foreground mt-1">Manage your life areas and focus domains</p>
          </div>
          <AddAreaDialog onAreaAdded={fetchAreas}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Area
            </Button>
          </AddAreaDialog>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="aspect-[5/3] animate-pulse overflow-hidden pt-0 pb-4">
              <CardContent className="p-0 h-full flex flex-col">
                {/* Image/Avatar Section - Top 2/3 */}
                <div className="h-2/3 relative flex items-center justify-center overflow-hidden bg-muted">
                  {/* Skeleton Avatar */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="h-16 w-16 mb-1 rounded-full bg-muted-foreground/20"></div>
                    <div className="h-5 bg-muted-foreground/20 rounded w-20"></div>
                  </div>
                  
                  {/* Skeleton Action Button */}
                  <div className="absolute top-2 right-2 z-20">
                    <div className="h-8 w-8 bg-muted-foreground/20 rounded"></div>
                  </div>
                </div>

                {/* Info Section - Bottom 1/3 */}
                <div className="h-1/3 p-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    {/* Priority Badge Skeleton */}
                    <div className="flex items-center justify-between">
                      <div className="h-5 bg-muted rounded-full w-16"></div>
                    </div>
                    
                    {/* Stats Skeleton */}
                    <div className="flex items-center justify-between">
                      <div className="h-3 bg-muted rounded w-16"></div>
                      <div className="h-3 bg-muted rounded w-12"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Areas</h1>
          <p className="text-muted-foreground mt-1">Manage your life areas and focus domains</p>
        </div>
        <AddAreaDialog onAreaAdded={fetchAreas}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Area
          </Button>
        </AddAreaDialog>
      </div>

      {areas.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-muted-foreground mb-2">No areas yet</h2>
          <p className="text-muted-foreground mb-4">Create your first area to organize your projects and tasks</p>
          <AddAreaDialog onAreaAdded={fetchAreas}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Area
            </Button>
          </AddAreaDialog>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {areas.map((area, index) => (
            <Card 
              key={area.id} 
              className="aspect-[5/3] cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group overflow-hidden pt-0 pb-4"
              onClick={() => handleAreaClick(area.id)}
            >
              <CardContent className="p-0 h-full flex flex-col">
                {/* Image/Avatar Section - Top 2/3 */}
                <div className="h-2/3 relative flex items-center justify-center overflow-hidden">
                  <div className={`absolute inset-0 ${getAreaColor(index)} opacity-90`}></div>
                  <div className="relative z-10 flex flex-col items-center text-white">
                    <Avatar className="h-16 w-16 mb-1 border-2 border-white/20 bg-white/10">
                      <AvatarFallback className="bg-transparent text-white text-lg font-bold">
                        {getAreaInitials(area.name)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-semibold text-center px-2 leading-tight">
                      {area.name}
                    </h3>
                  </div>
                  {/* Decorative pattern overlay */}
                  <div className="absolute inset-0 bg-black/5 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:20px_20px]"></div>
                  
                  {/* Action Button */}
                  <div className="absolute top-2 right-2 z-20">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
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
                            handleDuplicateArea(area);
                          }}
                          className="cursor-pointer"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate Area
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            openArchiveDialog(area);
                          }}
                          className="text-amber-600 focus:text-amber-600 cursor-pointer"
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          Archive Area
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteDialog(area);
                          }}
                          className="text-destructive focus:text-destructive cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Area
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Info Section - Bottom 1/3 */}
                <div className="h-1/3 p-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    {/* Priority Badge */}
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(area.priority)}`}>
                        <Flag className="h-3 w-3 mr-1" />
                        {area.priority}
                      </Badge>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <FolderOpen className="h-3 w-3" />
                        <span>{area._count.projects} projects</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckSquare className="h-3 w-3" />
                        <span>{area._count.tasks} tasks</span>
                      </div>
                    </div>

                    {/* Resources count if any */}
                    {area._count.resources > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        <span>{area._count.resources} resources</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add New Area Card */}
          <AddAreaDialog onAreaAdded={fetchAreas}>
            <Card className="aspect-[5/3] cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 group">
              <CardContent className="p-0 h-full flex flex-col items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                <div className="rounded-full bg-muted group-hover:bg-primary/10 p-6 mb-4 transition-colors">
                  <Plus className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-medium mb-1">New Area</h3>
                <p className="text-sm text-center px-4">Create a new focus area</p>
              </CardContent>
            </Card>
          </AddAreaDialog>
        </div>
      )}
      
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => {
          if (areaToDelete) {
            if (deleteAction === 'archive') {
              handleArchiveArea(areaToDelete.id);
            } else {
              handleDeleteArea(areaToDelete.id);
            }
          }
        }}
        title={deleteAction === 'archive' ? "Archive Area" : "Delete Area"}
        description={
          deleteAction === 'archive' 
            ? "Are you sure you want to archive this area? It can be restored later from the archives."
            : "Are you sure you want to permanently delete this area? This action cannot be undone."
        }
        itemName={areaToDelete?.name || ''}
      />
    </div>
  );
}
