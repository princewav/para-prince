"use client";

import React, { useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Star, MapPin, Target, CheckSquare, Folder, Flag, Calendar } from "lucide-react";
import { useFavorites } from "@/contexts/favorites-context";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function FavoritesMenu() {
  const { favorites, loading, refreshFavorites, getTotalCount } = useFavorites();
  const router = useRouter();
  const totalCount = getTotalCount();

  // Load favorites on component mount
  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const handleItemClick = (item: any, type: string) => {
    switch (type) {
      case 'AREA':
        router.push(`/dashboard/areas/${item.id}`);
        break;
      case 'PROJECT':
        router.push(`/dashboard/projects/${item.id}`);
        break;
      case 'TASK':
        // Navigate to the task within its project
        if (item.projectId) {
          router.push(`/dashboard/projects/${item.projectId}`);
        } else if (item.areaId) {
          router.push(`/dashboard/areas/${item.areaId}`);
        } else {
          router.push('/dashboard/tasks');
        }
        break;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'AREA':
        return <Folder className="h-3 w-3" />;
      case 'PROJECT':
        return <Target className="h-3 w-3" />;
      case 'TASK':
        return <CheckSquare className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'AREA':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'PROJECT':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'TASK':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return '';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'P2':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'P3':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading && totalCount === 0) {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 relative"
            disabled
          >
            <Star className="h-5 w-5 animate-pulse" />
          </Button>
        </HoverCardTrigger>
      </HoverCard>
    );
  }

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-10 w-10 relative transition-colors",
            totalCount > 0 ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Star className={cn("h-5 w-5", totalCount > 0 && "fill-current")} />
          {totalCount > 0 && (
            <Badge
              variant="secondary"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs justify-center items-center"
            >
              {totalCount > 99 ? '99+' : totalCount}
            </Badge>
          )}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent side="right" align="start" className="w-80 p-0">
        <Card className="border-0 shadow-none p-2">
          <CardContent className="p-2">
            {totalCount === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No favorites yet</p>
                <p className="text-xs">Click the star icon on items to favorite them</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {/* Areas */}
                {favorites.AREA.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      <Folder className="h-3 w-3" />
                      Areas
                    </h4>
                    {favorites.AREA.map((fav) => (
                      <div
                        key={fav.favoriteId}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleItemClick(fav.item, fav.type)}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Badge variant="outline" className={getTypeColor(fav.type)}>
                            {getTypeIcon(fav.type)}
                          </Badge>
                          {fav.item.priority && (
                            <Badge variant="outline" className={getPriorityColor(fav.item.priority)}>
                              <Flag className="h-3 w-3 mr-1" />
                              {fav.item.priority}
                            </Badge>
                          )}
                          <p className="text-sm font-medium truncate">{fav.item.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Projects */}
                {favorites.PROJECT.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      Projects
                    </h4>
                    {favorites.PROJECT.map((fav) => (
                      <div
                        key={fav.favoriteId}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleItemClick(fav.item, fav.type)}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Badge variant="outline" className={getTypeColor(fav.type)}>
                            {getTypeIcon(fav.type)}
                          </Badge>
                          {fav.item.priority && (
                            <Badge variant="outline" className={getPriorityColor(fav.item.priority)}>
                              <Flag className="h-3 w-3 mr-1" />
                              {fav.item.priority}
                            </Badge>
                          )}
                          {fav.item.dueDate && (
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(fav.item.dueDate)}
                            </Badge>
                          )}
                          <p className="text-sm font-medium truncate">{fav.item.name}</p>
                        </div>
                        {fav.item.area && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {fav.item.area.name}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Tasks */}
                {favorites.TASK.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      <CheckSquare className="h-3 w-3" />
                      Tasks
                    </h4>
                    {favorites.TASK.map((fav) => (
                      <div
                        key={fav.favoriteId}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleItemClick(fav.item, fav.type)}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Badge variant="outline" className={getTypeColor(fav.type)}>
                            {getTypeIcon(fav.type)}
                          </Badge>
                          {fav.item.priority && (
                            <Badge variant="outline" className={getPriorityColor(fav.item.priority)}>
                              <Flag className="h-3 w-3 mr-1" />
                              {fav.item.priority}
                            </Badge>
                          )}
                          {fav.item.completed && (
                            <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              ✓ Done
                            </Badge>
                          )}
                          <p className="text-sm font-medium truncate">{fav.item.name}</p>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          {fav.item.project && (
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {fav.item.project.name}
                            </span>
                          )}
                          {fav.item.area && !fav.item.project && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {fav.item.area.name}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </HoverCardContent>
    </HoverCard>
  );
}
