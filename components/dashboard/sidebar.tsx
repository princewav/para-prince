"use client";

import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Target,
  Folder,
  Archive,
  Library,
  Flame,
  ListTodo,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { FavoritesMenu } from "@/components/favorites-menu";
import { FavoritesProvider } from "@/contexts/favorites-context";

export function Sidebar() {
  const sidebarWidth = 60;
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  return (
    <FavoritesProvider>
      <TooltipProvider>
        <Card
          className="h-screen flex flex-col rounded-none transition-colors duration-200 fixed left-0 top-0 z-40 pb-0 gap-2 pt-2"
          style={{ width: `${sidebarWidth}px` }}
        >
        <CardHeader className="p-1 flex items-center justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-10 h-10 flex items-center justify-center">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>PARAPrince</p>
            </TooltipContent>
          </Tooltip>
        </CardHeader>
        <div className="border-t"></div>
        <CardContent className="flex-grow px-0.5 py-1">
          <nav className="gap-1 flex flex-col items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard/projects"
                  className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
                    isActive("/dashboard/projects")
                      ? "bg-primary/90 hover:bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-muted/50 active:bg-muted/70"
                  }`}
                >
                  <Target className="h-5 w-5 shrink-0" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Projects</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard/areas"
                  className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
                    isActive("/dashboard/areas")
                      ? "bg-primary/90 hover:bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-muted/50 active:bg-muted/70"
                  }`}
                >
                  <Folder className="h-5 w-5 shrink-0" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Areas</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center w-10 h-10 rounded-lg opacity-50 cursor-not-allowed">
                  <Library className="h-5 w-5 shrink-0 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Resources (Coming Soon)</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center w-10 h-10 rounded-lg opacity-50 cursor-not-allowed">
                  <Archive className="h-5 w-5 shrink-0 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Archives (Coming Soon)</p>
              </TooltipContent>
            </Tooltip>

            {/* Divider */}
            <div className="border-t w-full mb-2"></div>

            {/* Tasks */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard/tasks"
                  className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
                    isActive("/dashboard/tasks")
                      ? "bg-primary/90 hover:bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-muted/50 active:bg-muted/70"
                  }`}
                >
                  <ListTodo className="h-5 w-5 shrink-0" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Tasks</p>
              </TooltipContent>
            </Tooltip>

            {/* Favorites */}
            <FavoritesMenu />
          </nav>
        </CardContent>
        <div className="border-t flex justify-center items-center p-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <ThemeToggle isCompact={true} />
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </Card>
    </TooltipProvider>
    </FavoritesProvider>
  );
}
