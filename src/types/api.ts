import type {
  User,
  Post,
  Comment,
  Activity,
  Task,
  HealthRecord,
  LikeResponse,
  PaginatedResponse,
} from './models'

// ========================================================================
//  Auth API
// ========================================================================

export interface LoginRequest {
  phone: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface RegisterRequest {
  phone: string
  password: string
  nickname: string
  community: string
}

export interface RegisterResponse {
  token: string
  user: User
}

// ========================================================================
//  User API
// ========================================================================

export interface UpdateProfileRequest extends Partial<User> {}

export interface OnlineUsersResponse {
  items: User[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface TaskStats {
  published: number
  accepted: number
  total: number
}

// ========================================================================
//  Posts API
// ========================================================================

export interface GetPostsParams {
  page?: number
  limit?: number
  sort?: string
  order?: string
  user_id?: string
}

export interface CreatePostRequest {
  content: string
  images?: string[]
  location?: string
  visibility?: string
}

export type CreatePostResponse = Post

export interface UpdatePostRequest {
  content?: string
  images?: string[]
  location?: string
  visibility?: string
}

export interface DeletePostResponse {
  success: boolean
}

// ========================================================================
//  Comments API
// ========================================================================

export interface GetCommentsParams {
  page?: number
  limit?: number
}

export interface CreateCommentRequest {
  content: string
}

export type CreateCommentResponse = Comment

// ========================================================================
//  Activities API
// ========================================================================

export interface GetActivitiesParams {
  page?: number
  limit?: number
  status?: string
  category?: string
  sort?: string
  order?: string
}

export interface CreateActivityRequest {
  title: string
  description: string
  category: string
  location: string
  start_time: string
  end_time?: string
  max_participants?: number
  images?: string[]
}

export type CreateActivityResponse = Activity

export interface UpdateActivityRequest {
  title?: string
  description?: string
  category?: string
  location?: string
  start_time?: string
  end_time?: string
  max_participants?: number
  images?: string[]
  status?: string
}

export interface ActivityActionResponse {
  success: boolean
}

// ========================================================================
//  Tasks API
// ========================================================================

export interface GetTasksParams {
  page?: number
  limit?: number
  status?: string
  category?: string
}

export interface CreateTaskRequest {
  title: string
  description: string
  category?: string
  location: string
  reward?: string | number
}

export type CreateTaskResponse = Task

export interface UpdateTaskRequest {
  title?: string
  description?: string
  category?: string
  location?: string
  reward?: number | string
  deadline?: number
  status?: string
}

export type AcceptTaskResponse = Task
export type CompleteTaskResponse = Task
export type CancelTaskResponse = Task

export interface DeleteTaskResponse {
  id: string
}

export interface MyTasksResponse {
  published: Task[]
  accepted: Task[]
  all: Task[]
  stats: TaskStats
}

export interface MyTasksApiResponse {
  items: Task[]
  total: number
  page: number
  limit: number
}

// ========================================================================
//  Health API
// ========================================================================

export interface GetHealthRecordsParams {
  page?: number
  limit?: number
}

export interface HealthRecordsResponse {
  items: HealthRecord[]
  page: number
  limit: number
  total: number
  total_pages: number
}

export interface AddHealthRecordRequest {
  health_status?: 'good' | 'normal' | 'poor'
  temperature?: number
  notes?: string
  date?: string
}

export type AddHealthRecordResponse = HealthRecord

// ========================================================================
//  Unified API Response Wrapper
// ========================================================================

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
  timestamp?: number
  error?: {
    code: number
    message: string
    details?: any
  }
}

export interface PaginatedQueryParams {
  page?: number
  limit?: number
}
