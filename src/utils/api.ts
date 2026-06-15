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
    return new Promise((resolve, reject) => {
      const cur = getCurrentUser()
      if (!cur) {
        reject(new Error('未登录'))
        return
      }
      // 优先从该手机号的独立档案读取，保持与 profile 编辑保存一致
      try {
        const key = getUserStorageKey('linli_user_profile', cur.phone)
        const raw = localStorage.getItem(key)
        if (raw) {
          const parsed = JSON.parse(raw)
          parsed.last_active_at = Date.now()
          // 同步回 userInfo，保证首页显示一致
          localStorage.setItem('userInfo', JSON.stringify(parsed))
          resolve(parsed as User)
          return
        }
      } catch (e) {
        console.error('[user] getProfile 读取独立档案失败:', e)
      }
      // fallback：返回当前 userInfo
      resolve(cur)
    })
  },

  updateProfile: (partial: Partial<User>): Promise<User> => {
    return new Promise((resolve, reject) => {
      const cur = getCurrentUser()
      if (!cur) {
        reject(new Error('未登录，无法保存'))
        return
      }

      // 新老字段合并：以独立档案为主（保留历史字段），再合并新字段
      let saved: User = cur
      try {
        const key = getUserStorageKey('linli_user_profile', cur.phone)
        const raw = localStorage.getItem(key)
        if (raw) saved = JSON.parse(raw)
      } catch (e) {
        console.error('[user] updateProfile 读取独立档案失败:', e)
      }

      const merged: User = {
        ...saved,
        ...partial,
        updated_at: Date.now(),
        last_active_at: Date.now()
      }

      try {
        localStorage.setItem(getUserStorageKey('linli_user_profile', cur.phone), JSON.stringify(merged))
        localStorage.setItem('userInfo', JSON.stringify(merged))
        resolve(merged)
      } catch (e) {
        console.error('[user] updateProfile 持久化失败:', e)
        reject(new Error('保存失败，请稍后重试'))
      }
    })
  },

  getMyPosts: (): Promise<PaginatedResponse<Post>> => {
    return new Promise((resolve, reject) => {
      try {
        const biz = loadBusiness()
        const u = getCurrentUser()
        const myPosts = u
          ? biz.posts.filter(p => p.user_phone === u.phone || p.user_id === u.id || p.user_id === u.phone)
          : []
        resolve({
          items: myPosts.slice().sort((a, b) => b.created_at - a.created_at),
          page: 1,
          limit: myPosts.length,
          total: myPosts.length,
          total_pages: 1
        })
      } catch (e) {
        reject(e)
      }
    })
  },

  getMyActivities: (): Promise<PaginatedResponse<Activity>> => {
    return new Promise((resolve, reject) => {
      try {
        const biz = loadBusiness()
        const u = getCurrentUser()
        const my = u
          ? biz.activities.filter(a =>
              a.user_phone === u.phone ||
              a.user_id === u.id ||
              a.user_id === u.phone ||
              (a.participants && a.participants.some(p => p.user_phone === u.phone))
            )
          : []
        resolve({
          items: my.slice().sort((a, b) => b.created_at - a.created_at),
          page: 1,
          limit: my.length,
          total: my.length,
          total_pages: 1
        })
      } catch (e) {
        reject(e)
      }
    })
  },

  getTaskStats: (): Promise<{ published: number; accepted: number; total: number }> => {
    return new Promise((resolve, reject) => {
      try {
        const biz = loadBusiness()
        const u = getCurrentUser()
        if (!u) {
          resolve({ published: 0, accepted: 0, total: 0 })
          return
        }
        const published = biz.tasks.filter(t => t.user_phone === u.phone || t.user_id === u.id).length
        const accepted = biz.tasks.filter(t => t.helper_phone === u.phone || t.helper_id === u.id).length
        resolve({ published, accepted, total: published + accepted })
      } catch (e) {
        reject(e)
      }
    })
  },

  getOnlineUsers: (): Promise<User[]> => {
    return new Promise(resolve => {
      const cur = getCurrentUser()
      const users: User[] = []
      if (cur) {
        users.push({ ...cur, is_online: true })
      }
      // 演示账号
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

// ========================================================================
//  postsApi —— 邻里动态
// ========================================================================
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
  getActivities: (params?: {
    page?: number
    limit?: number
    status?: string
    category?: string
    sort?: string
    order?: string
  }): Promise<PaginatedResponse<Activity>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const biz = loadBusiness()
        let items = biz.activities.slice()
        if (params?.category && params.category !== 'all') {
          items = items.filter(a => a.category === params?.category)
        }
        if (params?.status && params.status !== 'all') {
          items = items.filter(a => a.status === params?.status)
        }
        items.sort((a, b) => b.created_at - a.created_at)
        resolve({
          items,
          page: params?.page || 1,
          limit: params?.limit || items.length,
          total: items.length,
          total_pages: 1
        })
      }, 200)
    })
  },

  getActivity: (id: string): Promise<Activity | null> => {
    return new Promise((resolve) => {
      const biz = loadBusiness()
      const a = biz.activities.find(x => x.id === id) || null
      resolve(a)
    })
  },

  createActivity: (data: {
    title: string
    description: string
    category: string
    location: string
    start_time: string
    end_time?: string
    max_participants?: number
    images?: string[]
  }): Promise<Activity> => {
    return new Promise((resolve, reject) => {
      const u = requireLogin()
      if (!data.title || data.title.trim().length === 0) {
        reject(new Error('请填写活动标题'))
        return
      }
      if (!data.location || data.location.trim().length === 0) {
        reject(new Error('请填写活动地点'))
        return
      }
      const now = Date.now()
      const activity: Activity = {
        id: nowId('a_'),
        user_id: u.id || u.phone,
        user_phone: u.phone,
        title: data.title.trim(),
        description: data.description.trim(),
        category: data.category || 'other',
        location: data.location.trim(),
        start_time: data.start_time ? new Date(data.start_time).getTime() : now,
        end_time: data.end_time ? new Date(data.end_time).getTime() : undefined,
        max_participants: data.max_participants,
        current_participants: 1,
        images: data.images || [],
        status: 'upcoming',
        created_at: now,
        updated_at: now,
        user: {
          id: u.id || u.phone,
          nickname: u.nickname,
          avatar: u.avatar,
          community: u.community
        },
        participants: [{
          id: nowId('p_'),
          user_id: u.id || u.phone,
          user_phone: u.phone,
          nickname: u.nickname,
          avatar: u.avatar,
          joined_at: now,
          status: 'registered'
        }],
        is_participant: true
      }

      const biz = loadBusiness()
      biz.activities.unshift(activity)
      saveBusiness(biz)
      resolve(activity)
    })
  },

  joinActivity: (id: string) => {
    return new Promise((resolve, reject) => {
      const u = requireLogin()
      const biz = loadBusiness()
      const activity = biz.activities.find(a => a.id === id)
      if (!activity) {
        reject(new Error('活动不存在'))
        return
      }

      if (activity.max_participants && (activity.current_participants || 0) >= activity.max_participants) {
        reject(new Error('活动名额已满'))
        return
      }

      const participants = activity.participants || []
      const already = participants.some(p => p.user_phone === u.phone || p.user_id === u.id)
      if (already) {
        reject(new Error('您已经报名，不能重复报名'))
        return
      }

      participants.push({
        id: nowId('p_'),
        user_id: u.id || u.phone,
        user_phone: u.phone,
        nickname: u.nickname,
        avatar: u.avatar,
        joined_at: Date.now(),
        status: 'registered'
      })
      activity.participants = participants
      activity.current_participants = participants.length
      activity.is_participant = true
      activity.updated_at = Date.now()
      saveBusiness(biz)
      resolve({ success: true, id })
    })
  },

  leaveActivity: (id: string) => {
    return new Promise((resolve, reject) => {
      const u = requireLogin()
      const biz = loadBusiness()
      const activity = biz.activities.find(a => a.id === id)
      if (!activity) {
        reject(new Error('活动不存在'))
        return
      }
      const participants = (activity.participants || []).filter(p =>
        !(p.user_phone === u.phone || p.user_id === u.id || p.user_id === u.phone)
      )
      activity.participants = participants
      activity.current_participants = participants.length
      activity.is_participant = false
      activity.updated_at = Date.now()
      saveBusiness(biz)
      resolve({ success: true })
    })
  },

  updateActivity: (id: string, data: Partial<Activity>) => {
    return new Promise((resolve, reject) => {
      const u = requireLogin()
      const biz = loadBusiness()
      const idx = biz.activities.findIndex(a => a.id === id)
      if (idx < 0) {
        reject(new Error('活动不存在'))
        return
      }
      const activity = biz.activities[idx]
      // 后端式鉴权：仅发布者可编辑
      if (!(activity.user_phone === u.phone || activity.user_id === u.id || activity.user_id === u.phone)) {
        reject(new Error('仅活动发布者可以修改'))
        return
      }
      const updated = {
        ...activity,
        ...data,
        start_time: (data as any).start_time && typeof (data as any).start_time === 'string'
          ? new Date((data as any).start_time).getTime()
          : (data as any).start_time || activity.start_time,
        updated_at: Date.now()
      }
      biz.activities[idx] = updated
      saveBusiness(biz)
      resolve(updated)
    })
  },

  deleteActivity: (id: string) => {
    return new Promise((resolve, reject) => {
      const u = requireLogin()
      const biz = loadBusiness()
      const idx = biz.activities.findIndex(a => a.id === id)
      if (idx < 0) {
        reject(new Error('活动不存在'))
        return
      }
      const activity = biz.activities[idx]
      if (!(activity.user_phone === u.phone || activity.user_id === u.id || activity.user_id === u.phone)) {
        reject(new Error('仅活动发布者可以删除'))
        return
      }
      biz.activities.splice(idx, 1)
      saveBusiness(biz)
      resolve({ success: true, id })
    })
  }
}

// ========================================================================
//  tasksApi —— 互助任务
// ========================================================================
//  关键保障：
//  - 发布任务：必须登录；任务带 user_phone
//  - 接单：必须登录；不能接自己发布的；一账号一任务仅能接一次
//  - 完成/取消：仅任务发布者或接单人可以操作
// ========================================================================

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
