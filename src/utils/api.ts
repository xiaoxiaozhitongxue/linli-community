// ==========================================================================
//  统一 API 层（前端 → 云端）
// ==========================================================================
//
//  设计原则
//  --------
//  1. **所有业务数据都走云端 API**（任务、帖子、活动、健康记录等）
//  2. **统一的响应格式**：所有 API 通过 get/post/put/del 调用，返回 {success, message, data}
//  3. **后端权限校验**：修改/删除/接单等写操作由云端验证 owner 和合法性
//  4. **登录态**：仅 JWT token + 当前用户信息存 localStorage
//
//  模块
//  ----
//    authApi       登录/注册（手机号为身份标识）
//    userApi       用户档案 / 在线用户 / 我的任务/帖子/活动/收藏
//    postsApi      邻里动态
//    activitiesApi 活动中心
//    tasksApi      互助任务
//    healthApi     健康打卡记录
//
// ==========================================================================

import {
  onLogout,
} from './storage'
import { get, post, put, del } from './request'

// ========================================================================
//  类型定义 - 请使用 src/types/models.ts
// ========================================================================
import type { User, Post, Comment, Activity, Task, HealthRecord, PaginatedResponse, LikeResponse } from '../types/models'
export type { User, Post, Comment, Activity, Task, HealthRecord, PaginatedResponse, LikeResponse }

// ========================================================================
//  authApi —— 登录/注册
// ========================================================================
// @deprecated 请使用 src/services/authService
export const authApi = {
  login: (data: { phone: string; password: string }) => {
    return post<{ token: string; user: User }>('/api/auth/login', data, { showError: true })
  },

  logout: () => {
    onLogout()
    return Promise.resolve({ success: true })
  },

  register: (data: { phone: string; password: string; nickname: string; community: string }) => {
    return post<{ token: string; user: User }>('/api/auth/register', data, { showError: true })
  }
}

// ========================================================================
//  userApi —— 用户档案（profile 保存/获取 / 我发布的 / 我的收藏）
// ========================================================================
// @deprecated 请使用 src/services/ 下的对应服务层
export const userApi = {
  getProfile: (): Promise<User> => {
    return get<User>('/api/user/profile')
  },

  updateProfile: (partial: Partial<User>): Promise<User> => {
    return put<User>('/api/user/profile', partial, { showError: true })
  },

  getMyPosts: (): Promise<PaginatedResponse<Post>> => {
    return get<PaginatedResponse<Post>>('/api/user/posts')
  },

  getMyActivities: (): Promise<PaginatedResponse<Activity>> => {
    return get<PaginatedResponse<Activity>>('/api/user/activities')
  },

  getTaskStats: (): Promise<{ published: number; accepted: number; total: number }> => {
    return get<{ published: number; accepted: number; total: number }>('/api/tasks/my').then((res: any) => {
      const stats = res.stats || { published: 0, accepted: 0, total: 0 }
      return stats
    }).catch(() => ({ published: 0, accepted: 0, total: 0 }))
  },

  getOnlineUsers: (): Promise<User[]> => {
    return get<{ items: User[]; total: number; page: number; limit: number; total_pages: number }>('/api/users', { online: '1', limit: 20 })
      .then((res: any) => {
        const items = (res && res.items) || []
        return items.map((u: any) => ({ ...u, is_online: true }))
      })
      .catch(() => {
        return []
      })
  }
}

// @deprecated 请使用 src/services/postService
export const postsApi = {
  getPosts: (params?: { page?: number; limit?: number; sort?: string; order?: string; user_id?: string }): Promise<PaginatedResponse<Post>> => {
    return get<PaginatedResponse<Post>>('/api/posts', params)
  },

  getPost: (id: string): Promise<Post> => {
    return get<Post>(`/api/posts/${id}`)
  },

  createPost: (data: { content: string; images?: string[]; location?: string; visibility?: string }): Promise<Post> => {
    return post<Post>('/api/posts', {
      content: data.content.trim(),
      images: data.images || [],
      location: data.location || '',
      visibility: data.visibility || 'public'
    }, { showError: true })
  },

  likePost: (postId: string): Promise<LikeResponse> => {
    return post<LikeResponse>(`/api/posts/${postId}/like`, {}, { showError: false })
  },

  deletePost: (postId: string): Promise<{ success: boolean }> => {
    return del<{ success: boolean }>(`/api/posts/${postId}`, {}, { showError: true })
  },

  getComments: (postId: string, params?: { limit?: number }): Promise<PaginatedResponse<Comment>> => {
    return get<PaginatedResponse<Comment>>(`/api/posts/${postId}/comments`, params)
  },

  createComment: (postId: string, data: { content: string }): Promise<Comment> => {
    return post<Comment>(`/api/posts/${postId}/comments`, {
      content: data.content.trim()
    }, { showError: true })
  }
}

// ========================================================================
//  activitiesApi —— 活动中心
// ========================================================================
// @deprecated 请使用 src/services/activityService
export const activitiesApi = {
  getActivities: (params?: { page?: number; limit?: number; status?: string; category?: string; sort?: string; order?: string }): Promise<PaginatedResponse<Activity>> => {
    return get<PaginatedResponse<Activity>>('/api/activities', params)
  },

  getActivity: (id: string): Promise<Activity> => {
    return get<Activity>(`/api/activities/${id}`)
  },

  createActivity: (data: { title: string; description: string; category: string; location: string; start_time: string; end_time?: string; max_participants?: number; images?: string[] }): Promise<Activity> => {
    return post<Activity>('/api/activities', {
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category || 'other',
      location: data.location.trim(),
      start_time: data.start_time,
      end_time: data.end_time,
      max_participants: data.max_participants,
      images: data.images || []
    }, { showError: true })
  },

  joinActivity: (id: string) => {
    return post(`/api/activities/${id}/join`, {}, { showError: true })
  },

  leaveActivity: (id: string) => {
    return del(`/api/activities/${id}/leave`, {}, { showError: true })
  },

  updateActivity: (id: string, data: Partial<Activity>) => {
    return put(`/api/activities/${id}`, data, { showError: true })
  },

  deleteActivity: (id: string) => {
    return del(`/api/activities/${id}`, {}, { showError: true })
  }
}

// @deprecated 请使用 src/services/taskService
export const tasksApi = {
  getTasks: (params?: { page?: number; limit?: number; status?: string; category?: string }) => {
    return get<{ items: Task[]; total: number; page: number; limit: number }>('/api/tasks', params)
  },

  getTask: (id: string) => {
    return get<Task>(`/api/tasks/${id}`)
  },

  createTask: (data: {
    title: string
    description: string
    category?: string
    location: string
    reward?: string | number
  }) => {
    return post<Task>('/api/tasks', {
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category || 'other',
      location: data.location.trim(),
      reward: typeof data.reward === 'string' ? parseFloat(data.reward) || 0 : Number(data.reward) || 0
    }, { showError: true })
  },

  acceptTask: (id: string) => {
    return post<Task>(`/api/tasks/${id}/accept`, {}, { showError: true })
  },

  completeTask: (id: string) => {
    return post<Task>(`/api/tasks/${id}/complete`, {}, { showError: true })
  },

  cancelTask: (id: string) => {
    return post<Task>(`/api/tasks/${id}/cancel`, {}, { showError: true })
  },

  updateTask: (id: string, data: Partial<Task>) => {
    return put<Task>(`/api/tasks/${id}`, data, { showError: true })
  },

  deleteTask: (id: string) => {
    return del<{ id: string }>(`/api/tasks/${id}`, {}, { showError: true })
  },

  getMyTasks: () => {
    return get<{
      published: Task[]
      accepted: Task[]
      all: Task[]
      stats: { published: number; accepted: number; total: number }
    }>('/api/tasks/my')
  }
}

// ========================================================================
//  healthApi —— 健康打卡记录
// ========================================================================
// @deprecated 请使用 src/services/healthService
export const healthApi = {
  getRecords: (): Promise<{ items: HealthRecord[]; page: number; limit: number; total: number; total_pages: number }> => {
    return get<{ items: HealthRecord[]; page: number; limit: number; total: number; total_pages: number }>('/api/health/records')
  },

  addRecord: (data?: { health_status?: 'good' | 'normal' | 'poor'; temperature?: number; notes?: string; date?: string }): Promise<HealthRecord> => {
    return post<HealthRecord>('/api/health/records', data || {}, { showError: true })
  }
}
