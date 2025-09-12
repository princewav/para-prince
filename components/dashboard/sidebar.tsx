
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Briefcase, Folder, Archive, Library, Flame } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from "@/components/theme-toggle";

export function Sidebar() {
  const sidebarWidth = 60;
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  return (
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
          <nav className="space-y-1 gap-1 flex flex-col items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link 
                  href="/dashboard/projects" 
                  className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
                    isActive('/dashboard/projects') 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'hover:bg-muted/50 active:bg-muted/70'
                  }`}
                >
                  <Briefcase className="h-5 w-5 shrink-0" />
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
                    isActive('/dashboard/areas') 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'hover:bg-muted/50 active:bg-muted/70'
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
                <Link 
                  href="/dashboard/resources" 
                  className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
                    isActive('/dashboard/resources') 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'hover:bg-muted/50 active:bg-muted/70'
                  }`}
                >
                  <Library className="h-5 w-5 shrink-0" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Resources</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link 
                  href="/dashboard/archives" 
                  className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
                    isActive('/dashboard/archives') 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'hover:bg-muted/50 active:bg-muted/70'
                  }`}
                >
                  <Archive className="h-5 w-5 shrink-0" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Archives</p>
              </TooltipContent>
            </Tooltip>
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
  );
}
