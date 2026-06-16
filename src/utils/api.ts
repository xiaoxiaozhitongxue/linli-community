// ==========================================================================
//  统一 API 层（前端 "后端"）
// ==========================================================================
//
//  设计原则
//  --------
//  1. **所有业务数据都走 storage.ts 中的 loadBusiness/saveBusiness**
//  2. **严格按手机号隔离**：每个账号使用 linli_business_data_${phone}
//  3. **后端权限校验**：修改/删除/接单等写操作必须是 owner 或合法状态
//  4. **一任务一账号仅能接一次**：在 acceptTask 中校验 helper_phone/id
//  5. **数据同步**：同一账号在任何页面修改后，其他页面重新加载会立即生效
//
//  模块
//  ----
//    authApi       登录/注册（手机号为身份标识）
//    userApi       用户档案（profile 保存/获取，我的帖子/活动/收藏等）
//    postsApi      邻里动态
//    activitiesApi 活动中心
//    tasksApi      互助任务（带发布者/接单者 owner 校验）
//
// ==========================================================================

import {
  loadBusiness,
  saveBusiness,
  getCurrentUser,
  isOwner,
  requireLogin,
  onLoginSuccess,
  onLogout,
  getUserStorageKey,
} from './storage'
import { get, post, put, del } from './request'
import { accountExists, verifyPassword, getAccount, registerAccount } from './account'

// ========================================================================
//  共享类型（与 storage.ts 中的业务数据对齐）
// ========================================================================

export interface User {
  id: string
  phone: string
  nickname: string
  avatar: string
  gender?: 'male' | 'female' | 'other'
  birthday?: string
  community: string
  address?: string
  bio?: string
  role: 'resident' | 'elderly' | 'volunteer' | 'merchant'
  credit_score: number
  is_verified: boolean
  created_at: number
  updated_at: number
  last_active_at: number
  is_online?: boolean
}

export interface Post {
  id: string
  user_id: string
  user_phone: string       // 稳定身份标识（用于 owner 校验）
  content: string
  images?: string[]
  location?: string
  visibility: 'public' | 'community' | 'private'
  like_count: number
  comment_count: number
  is_liked?: boolean
  created_at: number
  updated_at: number
  user: Partial<User>
  comments?: Comment[]
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  user_phone: string
  parent_comment_id?: string
  content: string
  created_at: number
  updated_at: number
  user: Partial<User>
}

export interface Activity {
  id: string
  user_id: string
  user_phone: string
  title: string
  description: string
  category: 'sports' | 'culture' | 'charity' | 'party' | 'other' | string
  location: string
  start_time: number
  end_time?: number
  max_participants?: number
  current_participants: number
  images?: string[]
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | string
  created_at: number
  updated_at: number
  user: Partial<User>
  participants?: Array<{ id: string; user_id: string; user_phone: string; nickname: string; avatar?: string; joined_at: number; status: 'registered' | 'attended' | 'absent' }>
  is_participant?: boolean
}

export interface Task {
  id: string
  user_id: string
  user_phone: string        // 发布者手机号（稳定身份）
  helper_id?: string        // 接单人的 id
  helper_phone?: string     // 接单人的手机号（用于"一账号一任务"去重）
  title: string
  description: string
  category: 'shopping' | 'delivery' | 'help' | 'companionship' | 'pet' | 'child' | 'other' | string
  location: string
  reward?: number | string
  deadline?: number
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | string
  created_at: number
  updated_at: number
  creator?: {
    id: string
    nickname: string
    avatar?: string
    credit_score: number
    is_verified?: boolean
    community?: string
  }
  helper?: {
    id: string
    nickname: string
    avatar?: string
    credit_score: number
    is_verified?: boolean
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  page: number
  limit: number
  total: number
  total_pages: number
}

export interface LikeResponse {
  liked: boolean
  like_count: number
}

// ========================================================================
//  辅助工具：构造写入后立即落盘的统一入口
// ========================================================================

const COMMENTS_STORAGE_KEY = 'linli_comments'  // 评论单独放一个桶，方便查询

function nowId(prefix: string = ''): string {
  return `${prefix}${Date.now()}_${Math.floor(Math.random() * 1000)}`
}

function getUserCommentsKey(phone: string): string {
  return `${COMMENTS_STORAGE_KEY}_${phone}`
}

function getUserComments(): { [postId: string]: Comment[] } {
  const phone = getCurrentUser()?.phone || 'public'
  const key = getUserCommentsKey(phone)
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('[api] 读取评论失败:', e)
  }
  return {}
}

function saveUserComments(data: { [postId: string]: Comment[] }): void {
  const phone = getCurrentUser()?.phone || 'public'
  const key = getUserCommentsKey(phone)
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error('[api] 保存评论失败:', e)
  }
}

// ========================================================================
//  authApi —— 登录/注册
// ========================================================================
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
    return new Promise(resolve => {
      const cur = getCurrentUser()
      const users: User[] = []
      if (cur) {
        users.push({ ...cur, is_online: true })
      }
      users.push(
        {
          id: 'demo-neighbour-1',
          phone: '13811112222',
          nickname: '热心邻居张阿姨',
          avatar: '',
          community: '阳光社区',
          role: 'volunteer',
          credit_score: 98,
          is_verified: true,
          created_at: Date.now() - 86400000 * 30,
          updated_at: Date.now(),
          last_active_at: Date.now() - 1000 * 60 * 2,
          is_online: true
        },
        {
          id: 'demo-neighbour-2',
          phone: '13811113333',
          nickname: '社区达人李先生',
          avatar: '',
          community: '阳光社区',
          role: 'resident',
          credit_score: 92,
          is_verified: true,
          created_at: Date.now() - 86400000 * 60,
          updated_at: Date.now(),
          last_active_at: Date.now() - 1000 * 60 * 15,
          is_online: true
        }
      )
      resolve(users)
    })
  }
}

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

  getComments: (postId: string): Promise<PaginatedResponse<Comment>> => {
    return get<PaginatedResponse<Comment>>(`/api/posts/${postId}/comments`)
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
