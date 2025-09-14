"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface FavoriteItem {
  favoriteId: number;
  itemId: number;
  type: 'AREA' | 'PROJECT' | 'TASK';
  item: any; // The actual area/project/task data
  createdAt: string;
}

export interface GroupedFavorites {
  AREA: FavoriteItem[];
  PROJECT: FavoriteItem[];
  TASK: FavoriteItem[];
}

interface FavoritesContextType {
  favorites: GroupedFavorites;
  loading: boolean;
  error: string | null;
  refreshFavorites: () => Promise<void>;
  getTotalCount: () => number;
  isFavorited: (itemId: number, itemType: 'AREA' | 'PROJECT' | 'TASK') => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
  userId?: string;
}

export function FavoritesProvider({ children, userId = 'default-user' }: FavoritesProviderProps) {
  const [favorites, setFavorites] = useState<GroupedFavorites>({
    AREA: [],
    PROJECT: [],
    TASK: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ userId });
      const response = await fetch(`/api/favorites?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }

      const data = await response.json();
      setFavorites(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch favorites';
      setError(errorMessage);
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const getTotalCount = useCallback(() => {
    return favorites.AREA.length + favorites.PROJECT.length + favorites.TASK.length;
  }, [favorites]);

  const isFavorited = useCallback((itemId: number, itemType: 'AREA' | 'PROJECT' | 'TASK') => {
    return favorites[itemType].some(fav => fav.itemId === itemId);
  }, [favorites]);

  const value: FavoritesContextType = {
    favorites,
    loading,
    error,
    refreshFavorites,
    getTotalCount,
    isFavorited,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}