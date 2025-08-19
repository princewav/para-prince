
"use client";

import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Briefcase, Folder, Archive, Library, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [isCompact, setIsCompact] = React.useState(false);

  return (
    <Card className={cn("h-screen flex flex-col rounded-none transition-all duration-300", isCompact ? "w-20" : "w-80")}>
      <CardHeader className={cn("transition-all duration-300 flex justify-between items-start", isCompact ? "p-2" : "p-6")}>
        <div className={cn({ "hidden": isCompact })}>
          <CardTitle>PARA Method</CardTitle>
          <CardDescription>Organize your digital life.</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsCompact(!isCompact)}>
          {isCompact ? <ChevronsRight /> : <ChevronsLeft />}
        </Button>
      </CardHeader>
      <CardContent className="flex-grow px-2">
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" className="border-b-0">
            <AccordionTrigger className="w-full hover:bg-muted/50 px-4" iconAlignment="center" showIcon={!isCompact}>
              <Link href="/dashboard/projects" className="flex items-center">
                <Briefcase className={cn({ "mr-2": !isCompact })} />
                {!isCompact && "Projects"}
              </Link>
            </AccordionTrigger>
            {!isCompact && (
              <AccordionContent>
                <p>View your projects here.</p>
              </AccordionContent>
            )}
          </AccordionItem>
          <AccordionItem value="item-2" className="border-b-0">
            <AccordionTrigger className="w-full hover:bg-muted/50 px-4" iconAlignment="center" showIcon={!isCompact}>
              <Link href="/dashboard/areas" className="flex items-center">
                <Folder className={cn({ "mr-2": !isCompact })} />
                {!isCompact && "Areas"}
              </Link>
            </AccordionTrigger>
            {!isCompact && (
              <AccordionContent>
                <p>Area 1</p>
                <p>Area 2</p>
              </AccordionContent>
            )}
          </AccordionItem>
          <AccordionItem value="item-3" className="border-b-0">
            <AccordionTrigger className="w-full hover:bg-muted/50 px-4" iconAlignment="center" showIcon={!isCompact}>
              <Link href="/dashboard/resources" className="flex items-center">
                <Library className={cn({ "mr-2": !isCompact })} />
                {!isCompact && "Resources"}
              </Link>
            </AccordionTrigger>
            {!isCompact && (
              <AccordionContent>
                <p>Resource 1</p>
                <p>Resource 2</p>
              </AccordionContent>
            )}
          </AccordionItem>
          <AccordionItem value="item-4" className="border-b-0">
            <AccordionTrigger className="w-full hover:bg-muted/50 px-4" iconAlignment="center" showIcon={!isCompact}>
              <Link href="/dashboard/archives" className="flex items-center">
                <Archive className={cn({ "mr-2": !isCompact })} />
                {!isCompact && "Archives"}
              </Link>
            </AccordionTrigger>
            {!isCompact && (
              <AccordionContent>
                <p>Archive 1</p>
                <p>Archive 2</p>
              </AccordionContent>
            )}
          </AccordionItem>
        </Accordion>
      </CardContent>
      <div className="p-4 border-t flex justify-center items-center">
        <ThemeToggle isCompact={isCompact} />
      </div>
    </Card>
  );
}
