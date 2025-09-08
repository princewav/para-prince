"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function ThemeToggle({ isCompact }: { isCompact?: boolean }) {
  const { theme, setTheme } = useTheme();

  const isDarkMode = theme === "dark";

  const handleToggle = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={isCompact ? "w-8 h-8 p-0 justify-center" : "w-full justify-start"}>
          <Settings className={isCompact ? "h-4 w-4" : "mr-2 h-4 w-4"} />
          {!isCompact && "Settings"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center justify-between">
          <span>Dark Mode</span>
          <Switch checked={isDarkMode} onCheckedChange={handleToggle} />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System Default
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
