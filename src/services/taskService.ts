import { get, post, put, del } from '../utils/request'
import type { Task } from '../types/models'
import type {
  GetTasksParams,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateTaskResponse,
  AcceptTaskResponse,
  CompleteTaskResponse,
  CancelTaskResponse,
  DeleteTaskResponse,
  MyTasksResponse
} from '../types/api'

export const taskService = {
  getTasks: (params?: GetTasksParams) =>
    get<{ items: Task[]; total: number; page: number; limit: number }>('/api/tasks', params),

  getTask: (id: string) =>
    get<Task>(`/api/tasks/${id}`),

  createTask: (data: CreateTaskRequest) =>
    post<CreateTaskResponse>('/api/tasks', {
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category || 'other',
      location: data.location.trim(),
      reward: typeof data.reward === 'string' ? parseFloat(data.reward) || 0 : Number(data.reward) || 0
    }, { showError: true }),

  acceptTask: (id: string) =>
    post<AcceptTaskResponse>(`/api/tasks/${id}/accept`, {}, { showError: true }),

  completeTask: (id: string) =>
    post<CompleteTaskResponse>(`/api/tasks/${id}/complete`, {}, { showError: true }),

  cancelTask: (id: string) =>
    post<CancelTaskResponse>(`/api/tasks/${id}/cancel`, {}, { showError: true }),

  updateTask: (id: string, data: UpdateTaskRequest) =>
    put<Task>(`/api/tasks/${id}`, data, { showError: true }),

  deleteTask: (id: string) =>
    del<DeleteTaskResponse>(`/api/tasks/${id}`, {}, { showError: true }),

  getMyTasks: () =>
    get<MyTasksResponse>('/api/tasks/my')
}
