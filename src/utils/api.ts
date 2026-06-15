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
  login: (data: { phone: string; code: string; nickname?: string; community?: string }) => {
    return new Promise<{ token: string; user: User }>((resolve, reject) => {
      setTimeout(() => {
        // 测试账号
        const testAccounts: Record<string, { password: string; nickname: string; community: string; phone: string }> = {
          '17276701841': { password: '123456', nickname: '管理员1', community: '阳光社区', phone: '17276701841' },
          '17276701842': { password: '123456', nickname: '管理员2', community: '阳光社区', phone: '17276701842' }
        }
        
        const testAccount = testAccounts[data.phone]
        if (testAccount) {
          // 测试账号登录
          if (data.code !== testAccount.password) {
            reject(new Error('密码错误'))
            return
          }
          // 使用测试账号对应的手机号存储
          data.phone = testAccount.phone
          data.nickname = testAccount.nickname
          data.community = testAccount.community
        } else {
          // 普通手机号登录验证
          if (!data.phone || data.phone.length !== 11 || !/^1\d{10}$/.test(data.phone)) {
            reject(new Error('请输入正确的手机号'))
            return
          }
          if (!data.code || data.code.length !== 6) {
            reject(new Error('请输入6位验证码'))
            return
          }
          
          // 检查手机号是否已注册
          if (!accountExists(data.phone)) {
            reject(new Error('该手机号未注册'))
            return
          }
          
          // 验证验证码（模拟系统不验证具体值，只要格式正确即可）
          // 实际生产环境应该调用短信验证码接口验证
          
          // 获取账号昵称
          const account = getAccount(data.phone)
          if (account) {
            data.nickname = account.nickname
          }
        }

        // 读取该手机号已有的档案（如果存在）
        let existing: User | null = null
        try {
          const key = getUserStorageKey('linli_user_profile', data.phone)
          const raw = localStorage.getItem(key)
          if (raw) existing = JSON.parse(raw) as User
        } catch (e) {
          console.error('[auth] 读取旧档案失败:', e)
        }

        const now = Date.now()
        const user: User = existing
          ? {
              ...existing,
              nickname: data.nickname || existing.nickname || '邻里用户',
              community: data.community || existing.community || '阳光社区',
              updated_at: now,
              last_active_at: now
            }
          : {
              id: 'user_' + now,
              phone: data.phone,
              nickname: data.nickname || '邻里用户',
              avatar: '',
              gender: undefined,
              birthday: '',
              community: data.community || '阳光社区',
              address: '',
              bio: '',
              role: 'resident',
              credit_score: 100,
              is_verified: true,
              created_at: now,
              updated_at: now,
              last_active_at: now
            }

        // 持久化档案（下次登录同手机号时保留）
        try {
          localStorage.setItem(getUserStorageKey('linli_user_profile', data.phone), JSON.stringify(user))
        } catch (e) {
          console.error('[auth] 持久化用户档案失败:', e)
        }

        // 设置当前登录态 + 初始化该账号的业务数据
        onLoginSuccess(user, 'token_' + now)
        resolve({ token: 'token_' + now, user })
      }, 400)
    })
  },

  logout: () => {
    onLogout()
    return Promise.resolve({ success: true })
  },

  register: (data: { phone: string; code: string; nickname: string }) => {
    return new Promise<{ token: string; user: User }>((resolve, reject) => {
      setTimeout(() => {
        // 验证输入
        if (!data.phone || data.phone.length !== 11 || !/^1\d{10}$/.test(data.phone)) {
          reject(new Error('请输入正确的手机号'))
          return
        }
        if (!data.code || data.code.length !== 6) {
          reject(new Error('请输入6位验证码'))
          return
        }
        if (!data.nickname || data.nickname.length < 2) {
          reject(new Error('昵称至少2位'))
          return
        }
        
        // 检查手机号是否已注册
        if (accountExists(data.phone)) {
          reject(new Error('该手机号已注册'))
          return
        }
        
        // 注册账号（使用手机号作为账号）
        const success = registerAccount(data.phone, data.code, data.nickname)
        if (!success) {
          reject(new Error('注册失败'))
          return
        }
        
        // 注册成功后自动登录
        const now = Date.now()
        const user: User = {
          id: 'user_' + now,
          phone: data.phone,
          nickname: data.nickname,
          avatar: '',
          gender: undefined,
          birthday: '',
          community: '阳光社区',
          address: '',
          bio: '',
          role: 'resident',
          credit_score: 100,
          is_verified: true,
          created_at: now,
          updated_at: now,
          last_active_at: now
        }
        
        localStorage.setItem(getUserStorageKey('linli_user_profile', data.phone), JSON.stringify(user))
        onLoginSuccess(user, 'token_' + now)
        resolve({ token: 'token_' + now, user })
      }, 400)
    })
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
    return new Promise((resolve) => {
      setTimeout(() => {
        const biz = loadBusiness()
        const items = biz.posts.slice().sort((a, b) => b.created_at - a.created_at)
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

  getPost: (id: string): Promise<Post | null> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const biz = loadBusiness()
        const p = biz.posts.find(x => x.id === id) || null
        resolve(p)
      }, 200)
    })
  },

  createPost: (data: { content: string; images?: string[]; location?: string; visibility?: string }): Promise<Post> => {
    return new Promise((resolve, reject) => {
      const u = requireLogin()
      if (!data.content || data.content.trim().length === 0) {
        reject(new Error('请填写动态内容'))
        return
      }

      const now = Date.now()
      const newPost: Post = {
        id: nowId('p_'),
        user_id: u.id || u.phone,
        user_phone: u.phone,
        content: data.content.trim(),
        images: data.images || [],
        location: data.location || '',
        visibility: (data.visibility as any) || 'public',
        like_count: 0,
        comment_count: 0,
        is_liked: false,
        created_at: now,
        updated_at: now,
        user: {
          id: u.id || u.phone,
          nickname: u.nickname,
          avatar: u.avatar,
          community: u.community,
          credit_score: u.credit_score
        },
        comments: []
      }

      const biz = loadBusiness()
      biz.posts.unshift(newPost)
      saveBusiness(biz)
      setTimeout(() => resolve(newPost), 150)
    })
  },

  likePost: (postId: string): Promise<LikeResponse> => {
    return new Promise((resolve) => {
      const biz = loadBusiness()
      const target = biz.posts.find(p => p.id === postId)
      if (!target) {
        resolve({ liked: false, like_count: 0 })
        return
      }
      const wasLiked = target.is_liked
      target.is_liked = !wasLiked
      target.like_count = Math.max(0, (target.like_count || 0) + (wasLiked ? -1 : 1))
      target.updated_at = Date.now()
      saveBusiness(biz)
      resolve({ liked: target.is_liked, like_count: target.like_count })
    })
  },

  deletePost: (postId: string): Promise<{ success: boolean }> => {
    return new Promise((resolve, reject) => {
      const u = requireLogin()
      const biz = loadBusiness()
      const idx = biz.posts.findIndex(p => p.id === postId)
      if (idx < 0) {
        reject(new Error('动态不存在或已删除'))
        return
      }
      const target = biz.posts[idx]
      // 后端式鉴权：仅发布者本人可删除
      if (!(target.user_phone && target.user_phone === u.phone) &&
          !(target.user_id && (target.user_id === u.id || target.user_id === u.phone))) {
        reject(new Error('只能删除自己发布的内容'))
        return
      }
      biz.posts.splice(idx, 1)
      saveBusiness(biz)
      resolve({ success: true })
    })
  },

  getComments: (postId: string): Promise<PaginatedResponse<Comment>> => {
    return new Promise(resolve => {
      const all = getUserComments()
      const list = (all[postId] || []).slice().sort((a, b) => a.created_at - b.created_at)
      resolve({
        items: list,
        page: 1,
        limit: list.length,
        total: list.length,
        total_pages: 1
      })
    })
  },

  createComment: (postId: string, data: { content: string }): Promise<Comment> => {
    return new Promise((resolve, reject) => {
      const u = requireLogin()
      if (!data.content || data.content.trim().length === 0) {
        reject(new Error('请输入评论内容'))
        return
      }
      const biz = loadBusiness()
      const post = biz.posts.find(p => p.id === postId)
      if (!post) {
        reject(new Error('动态不存在或已删除'))
        return
      }
      const now = Date.now()
      const c: Comment = {
        id: nowId('c_'),
        post_id: postId,
        user_id: u.id || u.phone,
        user_phone: u.phone,
        content: data.content.trim(),
        created_at: now,
        updated_at: now,
        user: { id: u.id || u.phone, nickname: u.nickname, avatar: u.avatar }
      }
      const all = getUserComments()
      if (!all[postId]) all[postId] = []
      all[postId].push(c)
      saveUserComments(all)

      // 同步计数
      post.comment_count = (post.comment_count || 0) + 1
      post.updated_at = now
      saveBusiness(biz)
      resolve(c)
    })
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
    return new Promise<{ items: Task[]; total: number; page: number; limit: number }>((resolve) => {
      setTimeout(() => {
        const biz = loadBusiness()
        let items = biz.tasks || []

        if (params?.status) {
          const s = String(params.status).toLowerCase()
          const key = s === 'open' ? 'pending' : s === 'ongoing' ? 'in_progress' : s
          items = items.filter(t => t.status === key)
        }
        if (params?.category && params.category !== 'all') {
          items = items.filter(t => t.category === params?.category)
        }
        items = items.slice().sort((a, b) => b.created_at - a.created_at)

        const limit = params?.limit || items.length
        const page = params?.page || 1
        const start = (page - 1) * limit
        const paged = items.slice(start, start + limit)

        resolve({ items: paged, total: items.length, page, limit })
      }, 150)
    })
  },

  getTask: (id: string) => {
    return new Promise<Task | null>((resolve) => {
      setTimeout(() => {
        const biz = loadBusiness()
        const task = (biz.tasks || []).find(t => t.id === id) || null
        resolve(task)
      }, 100)
    })
  },

  createTask: (data: {
    title: string
    description: string
    category?: string
    location: string
    reward?: string | number
  }) => {
    return new Promise<Task>((resolve, reject) => {
      const u = requireLogin()
      if (!data.title || data.title.trim().length === 0) {
        reject(new Error('请填写任务标题'))
        return
      }
      if (!data.description || data.description.trim().length === 0) {
        reject(new Error('请描述任务内容'))
        return
      }
      if (!data.location || data.location.trim().length === 0) {
        reject(new Error('请填写服务地点'))
        return
      }
      const now = Date.now()
      const task: Task = {
        id: 't_' + now + '_' + Math.floor(Math.random() * 1000),
        user_id: u.id || u.phone,
        user_phone: u.phone,
        title: data.title.trim(),
        description: data.description.trim(),
        category: (data.category as Task['category']) || 'other',
        location: data.location.trim(),
        reward: typeof data.reward === 'string' ? parseFloat(data.reward) || 0 : Number(data.reward) || 0,
        status: 'pending',
        created_at: now,
        updated_at: now,
        creator: {
          id: u.id || u.phone,
          nickname: u.nickname || '邻里用户',
          avatar: u.avatar || '',
          credit_score: u.credit_score || 100,
          is_verified: true,
          community: u.community || ''
        }
      }
      const biz = loadBusiness()
      biz.tasks.unshift(task)
      saveBusiness(biz)
      resolve(task)
    })
  },

  acceptTask: (id: string) => {
    return new Promise<Task>((resolve, reject) => {
      const u = requireLogin()
      const biz = loadBusiness()
      const tasks = biz.tasks || []
      const idx = tasks.findIndex(t => t.id === id)
      if (idx < 0) {
        reject(new Error('任务不存在或已删除'))
        return
      }
      const task = tasks[idx]

      if (task.status !== 'pending') {
        reject(new Error('当前任务状态不可接单'))
        return
      }

      // 1) 不能接自己发布的
      const isSelf =
        (task.user_phone && task.user_phone === u.phone) ||
        (task.user_id && (task.user_id === u.id || task.user_id === u.phone))
      if (isSelf) {
        reject(new Error('不能接自己发布的任务'))
        return
      }

      // 2) 一账号一任务仅能接一次
      const alreadyAccepted =
        (task.helper_phone && task.helper_phone === u.phone) ||
        (task.helper_id && (task.helper_id === u.id || task.helper_id === u.phone))
      if (alreadyAccepted) {
        reject(new Error('您已接过此任务，不能重复接单'))
        return
      }

      const updated: Task = {
        ...task,
        status: 'in_progress',
        helper_id: u.id || u.phone,
        helper_phone: u.phone,
        helper: {
          id: u.id || u.phone,
          nickname: u.nickname || '邻里用户',
          avatar: u.avatar || '',
          credit_score: u.credit_score || 100,
          is_verified: true
        },
        updated_at: Date.now()
      }
      biz.tasks = [...tasks.slice(0, idx), updated, ...tasks.slice(idx + 1)]
      saveBusiness(biz)
      resolve(updated)
    })
  },

  completeTask: (id: string) => {
    return new Promise<Task>((resolve, reject) => {
      const u = requireLogin()
      const biz = loadBusiness()
      const tasks = biz.tasks || []
      const idx = tasks.findIndex(t => t.id === id)
      if (idx < 0) {
        reject(new Error('任务不存在'))
        return
      }
      const task = tasks[idx]
      // 发布者 / 接单人 都可以完成
      const isPublisher =
        (task.user_phone && task.user_phone === u.phone) ||
        (task.user_id && (task.user_id === u.id || task.user_id === u.phone))
      const isHelper =
        (task.helper_phone && task.helper_phone === u.phone) ||
        (task.helper_id && (task.helper_id === u.id || task.helper_id === u.phone))
      if (!isPublisher && !isHelper) {
        reject(new Error('仅发布者或接单人可以完成任务'))
        return
      }

      const updated: Task = { ...task, status: 'completed', updated_at: Date.now() }
      biz.tasks = [...tasks.slice(0, idx), updated, ...tasks.slice(idx + 1)]
      saveBusiness(biz)
      resolve(updated)
    })
  },

  cancelTask: (id: string) => {
    return new Promise<Task>((resolve, reject) => {
      const u = requireLogin()
      const biz = loadBusiness()
      const tasks = biz.tasks || []
      const idx = tasks.findIndex(t => t.id === id)
      if (idx < 0) {
        reject(new Error('任务不存在'))
        return
      }
      const task = tasks[idx]
      const isPublisher =
        (task.user_phone && task.user_phone === u.phone) ||
        (task.user_id && (task.user_id === u.id || task.user_id === u.phone))
      if (!isPublisher) {
        reject(new Error('仅发布者可以取消任务'))
        return
      }
      const updated: Task = { ...task, status: 'cancelled', updated_at: Date.now() }
      biz.tasks = [...tasks.slice(0, idx), updated, ...tasks.slice(idx + 1)]
      saveBusiness(biz)
      resolve(updated)
    })
  },

  updateTask: (id: string, data: Partial<Task>) => {
    return new Promise<Task>((resolve, reject) => {
      const u = requireLogin()
      const biz = loadBusiness()
      const tasks = biz.tasks || []
      const idx = tasks.findIndex(t => t.id === id)
      if (idx < 0) {
        reject(new Error('任务不存在'))
        return
      }
      const task = tasks[idx]
      if (!isOwner(task)) {
        reject(new Error('仅发布者可以修改任务'))
        return
      }
      const updated: Task = { ...task, ...data, updated_at: Date.now() }
      biz.tasks = [...tasks.slice(0, idx), updated, ...tasks.slice(idx + 1)]
      saveBusiness(biz)
      resolve(updated)
    })
  },

  deleteTask: (id: string) => {
    return new Promise<{ id: string }>((resolve, reject) => {
      const u = requireLogin()
      const biz = loadBusiness()
      const tasks = biz.tasks || []
      const idx = tasks.findIndex(t => t.id === id)
      if (idx < 0) {
        reject(new Error('任务不存在'))
        return
      }
      const task = tasks[idx]
      if (!isOwner(task)) {
        reject(new Error('仅发布者可以删除任务'))
        return
      }
      biz.tasks = [...tasks.slice(0, idx), ...tasks.slice(idx + 1)]
      saveBusiness(biz)
      resolve({ id })
    })
  },

  getMyTasks: () => {
    return new Promise<{
      published: Task[]
      accepted: Task[]
      all: Task[]
      stats: { published: number; accepted: number; total: number }
    }>((resolve) => {
      setTimeout(() => {
        const biz = loadBusiness()
        const u = getCurrentUser()
        let published: Task[] = []
        let accepted: Task[] = []

        if (u) {
          published = (biz.tasks || []).filter(t =>
            (t.user_phone && t.user_phone === u.phone) ||
            (t.user_id && (t.user_id === u.id || t.user_id === u.phone))
          )
          accepted = (biz.tasks || []).filter(t =>
            (t.helper_phone && t.helper_phone === u.phone) ||
            (t.helper_id && (t.helper_id === u.id || t.helper_id === u.phone))
          )
        }
        published = published.slice().sort((a, b) => b.created_at - a.created_at)
        accepted = accepted.slice().sort((a, b) => b.created_at - a.created_at)

        resolve({
          published, accepted,
          all: [...published, ...accepted],
          stats: { published: published.length, accepted: accepted.length, total: published.length + accepted.length }
        })
      }, 150)
    })
  }
}
