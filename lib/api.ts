import { 
  ProjectWithTasks, 
  TaskWithRelations, 
  AreaWithTasks, 
  ResourceWithRelations,
  Archive,
  CreateTaskData,
  UpdateTaskData,
  CreateProjectData,
  UpdateProjectData,
  CreateAreaData,
  UpdateAreaData,
  CreateResourceData,
  UpdateResourceData
} from './types'

const API_BASE = '/api'

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.json()
}

// Projects API
export const projectsApi = {
  getAll: () => apiRequest<ProjectWithTasks[]>('/projects'),
  getById: (id: number) => apiRequest<ProjectWithTasks>(`/projects/${id}`),
  create: (data: CreateProjectData) => 
    apiRequest<ProjectWithTasks>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: UpdateProjectData) =>
    apiRequest<ProjectWithTasks>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiRequest<{ message: string }>(`/projects/${id}`, {
      method: 'DELETE',
    }),
}

// Tasks API
export const tasksApi = {
  getAll: (params?: { projectId?: number; areaId?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.projectId) searchParams.append('projectId', params.projectId.toString())
    if (params?.areaId) searchParams.append('areaId', params.areaId.toString())
    
    return apiRequest<TaskWithRelations[]>(`/tasks?${searchParams.toString()}`)
  },
  getById: (id: number) => apiRequest<TaskWithRelations>(`/tasks/${id}`),
  create: (data: CreateTaskData) =>
    apiRequest<TaskWithRelations>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: UpdateTaskData) =>
    apiRequest<TaskWithRelations>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  toggleComplete: (id: number, completed: boolean) =>
    apiRequest<TaskWithRelations>(`/tasks/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    }),
  delete: (id: number) =>
    apiRequest<{ message: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    }),
}

// Areas API
export const areasApi = {
  getAll: () => apiRequest<AreaWithTasks[]>('/areas'),
  getById: (id: number) => apiRequest<AreaWithTasks>(`/areas/${id}`),
  create: (data: CreateAreaData) =>
    apiRequest<AreaWithTasks>('/areas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: UpdateAreaData) =>
    apiRequest<AreaWithTasks>(`/areas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiRequest<{ message: string }>(`/areas/${id}`, {
      method: 'DELETE',
    }),
}

// Resources API
export const resourcesApi = {
  getAll: (params?: { projectId?: number; areaId?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.projectId) searchParams.append('projectId', params.projectId.toString())
    if (params?.areaId) searchParams.append('areaId', params.areaId.toString())
    
    return apiRequest<ResourceWithRelations[]>(`/resources?${searchParams.toString()}`)
  },
  getById: (id: number) => apiRequest<ResourceWithRelations>(`/resources/${id}`),
  create: (data: CreateResourceData) =>
    apiRequest<ResourceWithRelations>('/resources', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: UpdateResourceData) =>
    apiRequest<ResourceWithRelations>(`/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiRequest<{ message: string }>(`/resources/${id}`, {
      method: 'DELETE',
    }),
}

// Archives API
export const archivesApi = {
  getAll: (type?: string) => {
    const searchParams = new URLSearchParams()
    if (type) searchParams.append('type', type)
    
    return apiRequest<Archive[]>(`/archives?${searchParams.toString()}`)
  },
  restore: (id: number) =>
    apiRequest<{ message: string; restored: any }>(`/archives/${id}/restore`, {
      method: 'POST',
    }),
  deleteMany: (ids: number[]) =>
    apiRequest<{ message: string }>('/archives', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    }),
}