import { Project, Task, Area, Resource, Archive, Priority, Energy, Context, ProjectStatus, TaskStatus, ArchiveType } from '@prisma/client'

export type ProjectWithTasks = Project & {
  tasks: Task[]
  _count: {
    tasks: number
  }
}

export type TaskWithRelations = Task & {
  project?: {
    id: number
    name: string
  } | null
  area?: {
    id: number
    name: string
  } | null
}

export type AreaWithTasks = Area & {
  tasks: Task[]
  resources: Resource[]
  _count: {
    tasks: number
  }
}

export type ResourceWithRelations = Resource & {
  project?: {
    id: number
    name: string
  } | null
  area?: {
    id: number
    name: string
  } | null
}

// Re-export Prisma enums and types
export type {
  Project,
  Task,
  Area,
  Resource,
  Archive
}

export {
  Priority,
  Energy,
  Context,
  ProjectStatus,
  TaskStatus,
  ArchiveType
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// Form types for creating/updating entities
export interface CreateTaskData {
  name: string
  description?: string
  status?: TaskStatus
  priority?: Priority | null
  energy?: Energy | null
  context?: Context | null
  notes?: string
  dueDate?: string | null
  projectId?: number | null
  areaId?: number | null
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  completed?: boolean
}

export interface CreateProjectData {
  name: string
  description?: string
  status?: ProjectStatus
  priority?: Priority | null
  dueDate?: string | null
}

export interface UpdateProjectData extends Partial<CreateProjectData> {}

export interface CreateAreaData {
  name: string
  description?: string
  priority?: Priority
}

export interface UpdateAreaData extends Partial<CreateAreaData> {}

export interface CreateResourceData {
  name: string
  description?: string
  type?: string
  url?: string
  projectId?: number | null
  areaId?: number | null
}

export interface UpdateResourceData extends Partial<CreateResourceData> {}