import {
  FolderKanban,
  Folders,
  Archive,
  FileText,
  Calendar,
  Settings,
  BarChart,
  type LucideIcon,
} from "lucide-react";

export type Icon = LucideIcon;

export const Icons = {
  projects: FolderKanban,
  areas: Folders,
  resources: FileText,
  archives: Archive,
  calendar: Calendar,
  reports: BarChart,
  settings: Settings,
};
