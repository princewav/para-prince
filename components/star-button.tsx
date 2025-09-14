"use client";

import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface StarButtonProps {
  itemId: number;
  itemType: 'AREA' | 'PROJECT' | 'TASK';
  userId?: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  onToggle?: (isFavorited: boolean) => void;
}

export function StarButton({
  itemId,
  itemType,
  userId = 'default-user',
  className,
  size = "icon",
  variant = "ghost",
  onToggle,
}: StarButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if item is favorited on component mount
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const params = new URLSearchParams({
          itemId: itemId.toString(),
          itemType,
          userId,
        });

        const response = await fetch(`/api/favorites/check?${params}`);
        if (response.ok) {
          const data = await response.json();
          setIsFavorited(data.isFavorited);
        }
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    checkFavoriteStatus();
  }, [itemId, itemType, userId]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click handlers
    
    if (loading) return;
    
    setLoading(true);
    
    try {
      if (isFavorited) {
        // Remove favorite
        const params = new URLSearchParams({
          itemId: itemId.toString(),
          itemType,
          userId,
        });

        const response = await fetch(`/api/favorites?${params}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setIsFavorited(false);
          onToggle?.(false);
        } else {
          console.error('Failed to remove favorite');
        }
      } else {
        // Add favorite
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            itemId,
            itemType,
            userId,
          }),
        });

        if (response.ok) {
          setIsFavorited(true);
          onToggle?.(true);
        } else if (response.status === 409) {
          // Already favorited, just update state
          setIsFavorited(true);
          onToggle?.(true);
        } else {
          console.error('Failed to add favorite');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "transition-colors",
        isFavorited ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground hover:text-foreground",
        className
      )}
      onClick={toggleFavorite}
      disabled={loading}
      title={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Star
        className={cn(
          size === "sm" ? "h-3 w-3" : size === "lg" ? "h-6 w-6" : "h-4 w-4",
          isFavorited ? "fill-current" : "",
          loading && "animate-pulse"
        )}
      />
    </Button>
  );
}