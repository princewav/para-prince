
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
import { Briefcase, Folder, Archive, Library } from 'lucide-react';

export function Sidebar() {
  return (
    <Card className="w-80 h-screen">
      <CardHeader>
        <CardTitle>PARA Method</CardTitle>
        <CardDescription>Organize your digital life.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <div className="flex items-center">
                <Briefcase className="mr-2" />
                Projects
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p>Project 1</p>
              <p>Project 2</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>
              <div className="flex items-center">
                <Folder className="mr-2" />
                Areas
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p>Area 1</p>
              <p>Area 2</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>
              <div className="flex items-center">
                <Library className="mr-2" />
                Resources
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p>Resource 1</p>
              <p>Resource 2</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>
              <div className="flex items-center">
                <Archive className="mr-2" />
                Archives
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p>Archive 1</p>
              <p>Archive 2</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
