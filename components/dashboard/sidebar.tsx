
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
import { Briefcase, Folder, Archive, Library, ArrowRight, Settings } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from "@/components/theme-toggle";

const projects = [
  {
    id: 1,
    name: "Project 1",
    dueDate: new Date("2025-08-20"),
  },
  {
    id: 2,
    name: "Project 2",
    dueDate: new Date("2025-08-25"),
  },
  {
    id: 3,
    name: "Project 3",
    dueDate: new Date("2025-09-01"),
  },
].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

export function Sidebar() {
  return (
    <Card className="w-80 h-screen flex flex-col">
      <CardHeader>
        <CardTitle>PARA Method</CardTitle>
        <CardDescription>Organize your digital life.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger className="w-full" iconAlignment="center">
              <div className="flex items-center justify-between w-full h-full">
                <div className="flex items-center">
                  <Briefcase className="mr-2" />
                  Projects
                </div>
                <Link href="/dashboard/projects" className="ml-auto">
                  <Button variant="ghost" size="icon">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {projects.map((project) => (
                <div key={project.id} className="flex justify-between items-center">
                  <p>{project.name}</p>
                  <p className="text-sm text-gray-500">
                    {project.dueDate.toLocaleDateString()}
                  </p>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="w-full" iconAlignment="center">
              <div className="flex items-center justify-between w-full h-full">
                <div className="flex items-center">
                  <Folder className="mr-2" />
                  Areas
                </div>
                <Link href="/dashboard/areas" className="ml-auto">
                  <Button variant="ghost" size="icon">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p>Area 1</p>
              <p>Area 2</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="w-full" iconAlignment="center">
              <div className="flex items-center justify-between w-full h-full">
                <div className="flex items-center">
                  <Library className="mr-2" />
                  Resources
                </div>
                <Link href="/dashboard/resources" className="ml-auto">
                  <Button variant="ghost" size="icon">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p>Resource 1</p>
              <p>Resource 2</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger className="w-full" iconAlignment="center">
              <div className="flex items-center justify-between w-full h-full">
                <div className="flex items-center">
                  <Archive className="mr-2" />
                  Archives
                </div>
                <Link href="/dashboard/archives" className="ml-auto">
                  <Button variant="ghost" size="icon">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p>Archive 1</p>
              <p>Archive 2</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <div className="p-4 border-t">
        <ThemeToggle />
      </div>
    </Card>
  );
}
