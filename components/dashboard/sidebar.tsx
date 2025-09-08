
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Briefcase, Folder, Archive, Library, GripVertical, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [width, setWidth] = React.useState(320);
  const [isDragging, setIsDragging] = React.useState(false);
  const [previousWidth, setPreviousWidth] = React.useState(320);
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  const minWidth = 180;
  const maxWidth = 500;
  const compactWidth = 60;
  const [isCompact, setIsCompact] = React.useState(false);

  // Load saved width on mount
  React.useEffect(() => {
    const savedWidth = localStorage.getItem('sidebar-width');
    const savedIsCompact = localStorage.getItem('sidebar-compact') === 'true';
    
    if (savedWidth) {
      const parsedWidth = parseInt(savedWidth);
      setWidth(parsedWidth);
      if (!savedIsCompact) {
        setPreviousWidth(parsedWidth);
      }
    }
    setIsCompact(savedIsCompact);
  }, []);

  // Save width to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem('sidebar-width', width.toString());
    localStorage.setItem('sidebar-compact', isCompact.toString());
    
    // Update previous width only when not in compact mode
    if (!isCompact && width !== compactWidth) {
      setPreviousWidth(width);
    }
  }, [width, isCompact, compactWidth]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newWidth = e.clientX;
      if (newWidth < minWidth) {
        setWidth(minWidth);
      } else {
        setWidth(Math.min(maxWidth, newWidth));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="relative">
      <Card 
        ref={sidebarRef}
        className="h-screen flex flex-col rounded-none transition-colors duration-200"
        style={{ width: `${width}px` }}
      >
        <CardHeader className={cn("transition-all duration-200 flex items-center", isCompact ? "p-2 justify-center" : "p-4 justify-between")}>
          <div className={cn({ "hidden": isCompact })}>
            <CardTitle className="text-lg font-semibold">PARA Method</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              if (isCompact) {
                setIsCompact(false);
                setWidth(previousWidth);
              } else {
                setIsCompact(true);
                setWidth(compactWidth);
              }
            }}
            className="h-8 w-8 shrink-0"
          >
            {isCompact ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </Button>
        </CardHeader>
      <CardContent className={cn("flex-grow transition-all duration-200", isCompact ? "px-0.5 py-2" : "px-2 py-2")}>
        <nav className="space-y-1">
          <Link 
            href="/dashboard/projects" 
            className={cn(
              "flex items-center w-full hover:bg-muted/50 active:bg-muted/70 rounded-lg transition-all duration-200",
              isCompact ? "px-1 py-2.5 justify-center" : "px-2 py-2.5"
            )}
          >
            <div className={cn("flex items-center justify-center", isCompact ? "w-5 h-5" : "")}>
              <Briefcase className={cn("h-5 w-5 shrink-0", { "mr-3": !isCompact })} />
            </div>
            {!isCompact && <span className="font-medium">Projects</span>}
          </Link>
          <Link 
            href="/dashboard/areas" 
            className={cn(
              "flex items-center w-full hover:bg-muted/50 active:bg-muted/70 rounded-lg transition-all duration-200",
              isCompact ? "px-1 py-2.5 justify-center" : "px-2 py-2.5"
            )}
          >
            <div className={cn("flex items-center justify-center", isCompact ? "w-5 h-5" : "")}>
              <Folder className={cn("h-5 w-5 shrink-0", { "mr-3": !isCompact })} />
            </div>
            {!isCompact && <span className="font-medium">Areas</span>}
          </Link>
          <Link 
            href="/dashboard/resources" 
            className={cn(
              "flex items-center w-full hover:bg-muted/50 active:bg-muted/70 rounded-lg transition-all duration-200",
              isCompact ? "px-1 py-2.5 justify-center" : "px-2 py-2.5"
            )}
          >
            <div className={cn("flex items-center justify-center", isCompact ? "w-5 h-5" : "")}>
              <Library className={cn("h-5 w-5 shrink-0", { "mr-3": !isCompact })} />
            </div>
            {!isCompact && <span className="font-medium">Resources</span>}
          </Link>
          <Link 
            href="/dashboard/archives" 
            className={cn(
              "flex items-center w-full hover:bg-muted/50 active:bg-muted/70 rounded-lg transition-all duration-200",
              isCompact ? "px-1 py-2.5 justify-center" : "px-2 py-2.5"
            )}
          >
            <div className={cn("flex items-center justify-center", isCompact ? "w-5 h-5" : "")}>
              <Archive className={cn("h-5 w-5 shrink-0", { "mr-3": !isCompact })} />
            </div>
            {!isCompact && <span className="font-medium">Archives</span>}
          </Link>
        </nav>
      </CardContent>
      <div className={cn("border-t flex justify-center items-center transition-all duration-200", isCompact ? "p-1.5" : "p-3")}>
        <ThemeToggle isCompact={isCompact} />
      </div>
      </Card>
      <div
        className={cn(
          "absolute top-0 right-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-border transition-colors duration-200 flex items-center justify-center group",
          isDragging && "bg-border w-2"
        )}
        onMouseDown={handleMouseDown}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>
    </div>
  );
}
