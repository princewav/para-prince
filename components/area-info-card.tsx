"use client";

import { Button } from "@/components/ui/button";
import { Card as CardVariant, CardContent as CardContentVariant } from "@/components/ui/card-variant";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flag, Edit, Target, ListTodo, Book } from "lucide-react";
import { useState } from "react";
import { Priority } from "@/lib/types";
import { getPriorityColor } from "@/lib/badge-utils";
import { capitalize } from "@/lib/utils";

interface Area {
  id: number;
  name: string;
  description?: string | null;
  priority: Priority;
}

interface AreaInfoCardProps {
  area: Area;
  onUpdate: (field: string, value: string | null) => void;
  stats?: {
    projects: number;
    tasks: number;
    resources: number;
  };
}

export function AreaInfoCard({ area, onUpdate, stats }: AreaInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);

  const startEditing = (field: string) => {
    setIsEditing(true);
    setEditingField(field);
  };

  const stopEditing = () => {
    setIsEditing(false);
    setEditingField(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent, field: string, value: string) => {
    if (e.key === 'Enter') {
      onUpdate(field, value);
      stopEditing();
    } else if (e.key === 'Escape') {
      stopEditing();
    }
  };

  return (
    <div className="mb-4">
      <CardVariant padding="sm" className="p-3">
        <CardContentVariant padding="sm" className="">
          <div className="flex items-center justify-between">
            {/* Left side: Priority and Description */}
            <div className="flex items-center gap-4 flex-1">
              {/* Priority */}
              <div className="flex items-center gap-2" onClick={() => startEditing('priority')}>
                <Flag className="h-3 w-3 text-muted-foreground" />
                {isEditing && editingField === 'priority' ? (
                  <Select
                    defaultValue={area.priority}
                    onValueChange={(value: string) => {
                      onUpdate('priority', value);
                      stopEditing();
                    }}
                  >
                    <SelectTrigger className="w-16 h-5 border-none shadow-none focus:ring-0 bg-transparent text-xs px-1 py-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="P1">P1</SelectItem>
                      <SelectItem value="P2">P2</SelectItem>
                      <SelectItem value="P3">P3</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full border cursor-pointer hover:opacity-80 transition-opacity ${getPriorityColor(area.priority)}`}>
                    {area.priority}
                  </span>
                )}
              </div>
              
              {/* Area Description */}
              <div className="flex-1" onClick={() => startEditing('description')}>
                {isEditing && editingField === 'description' ? (
                  <Textarea
                    defaultValue={area.description || ''}
                    onBlur={(e) => {
                      onUpdate('description', e.target.value || null);
                      stopEditing();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        stopEditing();
                      }
                    }}
                    className="text-sm text-muted-foreground leading-relaxed border border-border/40 shadow-none focus-visible:ring-0 focus-visible:border-ring px-2 py-1 bg-transparent h-6 rounded-md resize-none overflow-hidden w-full"
                    placeholder="Add area description..."
                    autoFocus
                  />
                ) : (
                  <p className="text-sm text-muted-foreground cursor-pointer hover:bg-muted/20 px-2 py-1 rounded -mx-2 -my-1 truncate">
                    {area.description || (
                      <span className="text-muted-foreground/50 italic text-xs">Add description...</span>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Right side: Stats with Icons */}
            {stats && (
              <div className="flex items-center gap-4 ml-6">
                <div className="flex items-center gap-1 text-sm">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{stats.projects}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <ListTodo className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{stats.tasks}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Book className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{stats.resources}</span>
                </div>
              </div>
            )}
          </div>
        </CardContentVariant>
      </CardVariant>
    </div>
  );
}