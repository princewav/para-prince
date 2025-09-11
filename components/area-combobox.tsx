"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Area {
  id: number;
  name: string;
  description?: string | null;
}

interface AreaComboboxProps {
  areas: Area[];
  value?: string;
  onValueChange: (value: string) => void;
  onCreateArea: (name: string) => Promise<Area>;
  disabled?: boolean;
  placeholder?: string;
}

export function AreaCombobox({
  areas,
  value,
  onValueChange,
  onCreateArea,
  disabled = false,
  placeholder = "Select area...",
}: AreaComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);

  const selectedArea = areas.find((area) => area.id.toString() === value);

  const showCreateOption = 
    searchValue.length > 0 && 
    !areas.some(area => area.name.toLowerCase() === searchValue.toLowerCase());

  const handleCreateArea = async () => {
    if (!searchValue.trim() || isCreating) return;
    
    setIsCreating(true);
    try {
      const newArea = await onCreateArea(searchValue.trim());
      onValueChange(newArea.id.toString());
      setSearchValue("");
      setOpen(false);
    } catch (error) {
      console.error("Error creating area:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedArea ? selectedArea.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search or create area..." 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandGroup>
              {areas
                .filter((area) =>
                  area.name.toLowerCase().includes(searchValue.toLowerCase())
                )
                .map((area) => (
                  <CommandItem
                    key={area.id}
                    value={area.name}
                    onSelect={() => {
                      onValueChange(area.id.toString());
                      setOpen(false);
                      setSearchValue("");
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === area.id.toString() ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {area.name}
                  </CommandItem>
                ))}
              
              {showCreateOption && (
                <CommandItem
                  value={`create-${searchValue}`}
                  onSelect={handleCreateArea}
                  disabled={isCreating}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {isCreating ? "Creating..." : `Create "${searchValue}"`}
                </CommandItem>
              )}
            </CommandGroup>
            
            {areas.filter((area) =>
              area.name.toLowerCase().includes(searchValue.toLowerCase())
            ).length === 0 && !showCreateOption && searchValue && (
              <CommandEmpty>No areas found.</CommandEmpty>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}