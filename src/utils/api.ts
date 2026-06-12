import { get, post, put, del } from './request'

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
  content: string
  images?: string[]
  location?: string
  visibility: 'public' | 'community' | 'private'
  like_count: number
  comment_count: number
  created_at: number
  updated_at: number
  user: User
  is_liked?: boolean
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  parent_comment_id?: string
  content: string
  created_at: number
  updated_at: number
  user: User
}

export interface Activity {
  id: string
  user_id: string
  title: string
  description: string
  category: 'sports' | 'culture' | 'charity' | 'party' | 'other'
  location: string
  start_time: number
  end_time?: number
  max_participants?: number
  current_participants: number
  images?: string[]
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  created_at: number
  updated_at: number
  user: Partial<User>
  is_participant?: boolean
  participants?: Array<{
    id: string
    user_id: string
    nickname: string
    avatar?: string
    joined_at: number
    status: 'registered' | 'attended' | 'absent'
  }>
}

export interface ActivityParticipant {
  id: string
  activity_id: string
  user_id: string
  nickname: string
  avatar?: string
  joined_at: number
  status: 'registered' | 'attended' | 'absent'
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

export interface Topic {
  id: string
  name: string
  posts: number
  participants: number
  emoji?: string
}

export interface ChatRoom {
  id: string
  name: string
  emoji: string
  description: string
  members: number
  today_messages: number
  bg_color: string
}

export interface InterestGroup {
  id: string
  name: string
  members: number
  emoji: string
  bg_color: string
  is_joined: boolean
}

const MOCK_MODE = true

// 用户数据存储键名前缀
const USER_DATA_PREFIX = 'linli_user_data_'

// 各模块存储键名
const ACTIVITIES_STORAGE_KEY = 'linli_activities'

// 初始化用户数据结构
interface UserData {
  posts: Post[]
  activities: Activity[]
  tasks: any[]
  myCreatedTasks: any[]
  myAcceptedTasks: any[]
  messages: any[]
  notifications: any[]
}

// 获取用户数据键名
function getUserDataKey(phone: string): string {
  return `${USER_DATA_PREFIX}${phone}`
}

// 初始化用户数据
function initUserData(phone: string): UserData {
  return {
    posts: [],
    activities: [],
    tasks: [],
    myCreatedTasks: [],
    myAcceptedTasks: [],
    messages: [],
    notifications: []
  }
}

// 获取用户数据
function getUserData(phone: string): UserData {
  try {
    const key = getUserDataKey(phone)
    const stored = localStorage.getItem(key)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('读取用户数据失败', e)
  }
  return initUserData(phone)
}

// 保存用户数据
function saveUserData(phone: string, data: UserData): void {
  try {
    const key = getUserDataKey(phone)
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error('保存用户数据失败', e)
  }
}

// 获取当前登录用户的手机号
function getCurrentPhone(): string | null {
  try {
    const userInfo = localStorage.getItem('userInfo')
    if (userInfo) {
      const user = JSON.parse(userInfo)
      return user.phone || null
    }
  } catch (e) {
    console.error('读取当前用户失败', e)
  }
  return null
}

// 获取当前用户的独立数据
function getCurrentUserData(): UserData | null {
  const phone = getCurrentPhone()
  if (!phone) return null
  return getUserData(phone)
}

// 保存当前用户的独立数据
function saveCurrentUserData(data: UserData): void {
  const phone = getCurrentPhone()
  if (!phone) return
  saveUserData(phone, data)
}

const mockUsers: User[] = [
  {
    id: '1',
    phone: '13800138001',
    nickname: '阳光社区小李',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    gender: 'male',
    community: '阳光社区',
    address: '1号楼101室',
    bio: '喜欢分享生活点滴',
    role: 'resident',
    credit_score: 95,
    is_verified: true,
    created_at: Date.now() - 86400000 * 30,
    updated_at: Date.now(),
    last_active_at: Date.now() - 3600000
  },
  {
    id: '2',
    phone: '13800138002',
    nickname: '热心肠王阿姨',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    gender: 'female',
    community: '阳光社区',
    address: '2号楼202室',
    bio: '社区志愿者，乐于助人',
    role: 'volunteer',
    credit_score: 98,
    is_verified: true,
    created_at: Date.now() - 86400000 * 60,
    updated_at: Date.now(),
    last_active_at: Date.now() - 7200000
  },
  {
    id: '3',
    phone: '13800138003',
    nickname: '创业者张先生',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    gender: 'male',
    community: '阳光社区',
    address: '3号楼303室',
    bio: '社区咖啡店主',
    role: 'merchant',
    credit_score: 92,
    is_verified: true,
    created_at: Date.now() - 86400000 * 45,
    updated_at: Date.now(),
    last_active_at: Date.now() - 1800000
  }
]

const mockPosts: Post[] = [
  {
    id: '1',
    user_id: '1',
    content: '今天天气真好，带孩子在社区花园散步，发现花园里的花都开了！大家有空也出来晒晒太阳呀～',
    images: [
      'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=400&fit=crop'
    ],
    location: '阳光社区花园',
    visibility: 'public',
    like_count: 42,
    comment_count: 8,
    created_at: Date.now() - 3600000,
    updated_at: Date.now() - 3600000,
    user: mockUsers[0],
    is_liked: false
  },
  {
    id: '2',
    user_id: '2',
    content: '本周六上午9点在社区活动中心将举行老年人健康义诊活动，邀请了社区医院的医生为大家免费测量血压血糖，欢迎各位邻居参加！',
    location: '阳光社区活动中心',
    visibility: 'public',
    like_count: 67,
    comment_count: 15,
    created_at: Date.now() - 86400000,
    updated_at: Date.now() - 86400000,
    user: mockUsers[1],
    is_liked: false
  },
  {
    id: '3',
    user_id: '3',
    content: '我的社区咖啡店新品试营业啦！本周六周日全场8折，欢迎邻居们来品尝！地址：阳光社区商业街12号',
    images: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop'
    ],
    visibility: 'public',
    like_count: 89,
    comment_count: 23,
    created_at: Date.now() - 86400000 * 2,
    updated_at: Date.now() - 86400000 * 2,
    user: mockUsers[2],
    is_liked: false
  }
]

const mockComments: Comment[] = [
  {
    id: '1',
    post_id: '1',
    user_id: '2',
    content: '是啊，今天确实很美！我也去了',
    created_at: Date.now() - 3000000,
    updated_at: Date.now() - 3000000,
    user: mockUsers[1]
  },
  {
    id: '2',
    post_id: '1',
    user_id: '3',
    content: '晚上约个时间一起去呀！',
    created_at: Date.now() - 2400000,
    updated_at: Date.now() - 2400000,
    user: mockUsers[2]
  }
]

const mockActivities: Activity[] = [
  {
    id: '1',
    user_id: '2',
    title: '周末亲子烘焙活动',
    description: '邀请社区的家长和小朋友一起参加亲子烘焙，制作美味蛋糕！',
    category: 'other',
    location: '阳光社区活动中心',
    start_time: Date.now() + 86400000 * 2,
    max_participants: 20,
    current_participants: 15,
    status: 'upcoming',
    created_at: Date.now() - 86400000 * 3,
    updated_at: Date.now() - 86400000 * 3,
    user: mockUsers[1],
    is_participant: false
  },
  {
    id: '2',
    user_id: '1',
    title: '社区足球友谊赛',
    description: '每周日上午9点在社区运动场举行足球友谊赛，欢迎足球爱好者报名参加！',
    category: 'sports',
    location: '阳光社区运动场',
    start_time: Date.now() + 86400000 * 3,
    max_participants: 22,
    current_participants: 18,
    status: 'upcoming',
    created_at: Date.now() - 86400000 * 5,
    updated_at: Date.now() - 86400000 * 5,
    user: mockUsers[0],
    is_participant: false
  }
]

const mockLikeStates: Record<string, boolean> = {}

const mockTasks: Task[] = [
  {
    id: '1',
    user_id: '2',
    title: '帮忙取快递',
    description: '帮忙在小区快递柜取个快递，是个小包裹，感谢！',
    category: 'delivery',
    location: '2号楼楼下',
    reward: '5积分',
    status: 'pending',
    created_at: Date.now() - 3600000,
    updated_at: Date.now() - 3600000,
    creator: {
      id: '2',
      nickname: '热心肠王阿姨',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      credit_score: 98,
      is_verified: true,
      community: '阳光社区'
    }
  },
  {
    id: '2',
    user_id: '1',
    title: '帮忙买些菜',
    description: '明天上午帮忙在社区生鲜超市买些蔬菜，具体清单微信发',
    category: 'shopping',
    location: '1号楼',
    reward: '10积分',
    status: 'in_progress',
    created_at: Date.now() - 7200000,
    updated_at: Date.now() - 3600000,
    creator: {
      id: '1',
      nickname: '阳光社区小李',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      credit_score: 95,
      is_verified: true,
      community: '阳光社区'
    },
    helper: {
      id: '2',
      nickname: '热心肠王阿姨',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      credit_score: 98,
      is_verified: true
    }
  }
]

export const postsApi = {
  getPosts: (params?: { page?: number; limit?: number; sort?: string; order?: string; user_id?: string }) => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // 优先从用户独立数据读取
          const userData = getCurrentUserData()
          if (userData && userData.posts.length > 0) {
            resolve({
              items: userData.posts,
              page: params?.page || 1,
              limit: params?.limit || 10,
              total: userData.posts.length,
              total_pages: 1
            })
            return
          }
          // 如果没有用户数据，返回空数组（不再返回mockPosts）
          resolve({
            items: [],
            page: params?.page || 1,
            limit: params?.limit || 10,
            total: 0,
            total_pages: 1
          })
        }, 300)
      })
    }
    return get<PaginatedResponse<Post>>('/api/posts', params)
  },

  createPost: (data: { content: string; images?: string[]; location?: string; visibility?: string }) => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // 获取当前用户信息
          let currentUser = mockUsers[0]
          try {
            const savedUser = localStorage.getItem('userInfo')
            if (savedUser) {
              currentUser = JSON.parse(savedUser)
            }
          } catch (e) {
            console.error('读取用户信息失败', e)
          }

          const newPost: Post = {
            id: Date.now().toString(),
            user_id: currentUser.id || '1',
            content: data.content,
            images: data.images,
            location: data.location,
            visibility: data.visibility || 'public',
            like_count: 0,
            comment_count: 0,
            created_at: Date.now(),
            updated_at: Date.now(),
            user: currentUser,
            is_liked: false
          }

          // 保存到用户独立数据
          const userData = getCurrentUserData()
          if (userData) {
            userData.posts.unshift(newPost)
            saveCurrentUserData(userData)
          }
          resolve(newPost)
        }, 300)
      })
    }
    return post<Post>('/api/posts', data)
  },

  likePost: (postId: string) => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const userData = getCurrentUserData()
          if (userData) {
            const post = userData.posts.find(p => p.id === postId)
            if (post) {
              const wasLiked = post.is_liked || false
              post.is_liked = !wasLiked
              post.like_count = (post.like_count || 0) + (wasLiked ? -1 : 1)
              saveCurrentUserData(userData)
              resolve({
                liked: !wasLiked,
                like_count: post.like_count
              })
              return
            }
          }
          // 如果没找到，返回默认响应
          resolve({ liked: false, like_count: 0 })
        }, 200)
      })
    }
    return post<LikeResponse>(`/api/posts/${postId}/like`)
  },

  getComments: (postId: string, params?: { page?: number; limit?: number }) => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const comments = mockComments.filter(c => c.post_id === postId)
          resolve({
            items: comments,
            page: params?.page || 1,
            limit: params?.limit || 10,
            total: comments.length,
            total_pages: 1
          })
        }, 300)
      })
    }
    return get<PaginatedResponse<Comment>>(`/api/posts/${postId}/comments`, params)
  },

  createComment: (postId: string, data: { content: string; parent_comment_id?: string }) => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newComment: Comment = {
            id: Date.now().toString(),
            post_id: postId,
            user_id: '1',
            parent_comment_id: data.parent_comment_id,
            content: data.content,
            created_at: Date.now(),
            updated_at: Date.now(),
            user: mockUsers[0]
          }
          mockComments.unshift(newComment)
          const post = mockPosts.find(p => p.id === postId)
          if (post) {
            post.comment_count++
          }
          resolve(newComment)
        }, 300)
      })
    }
    return post<Comment>(`/api/posts/${postId}/comments`, data)
  }
}

export const authApi = {
  login: (data: { phone: string; code: string; nickname?: string; community?: string }) => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // 从localStorage读取已保存的用户信息
          let savedUser = null
          try {
            const savedUserStr = localStorage.getItem('userInfo')
            if (savedUserStr) {
              savedUser = JSON.parse(savedUserStr)
            }
          } catch (e) {
            console.error('读取用户信息失败', e)
          }

          let user: User
          const phone = data.phone
          
          if (savedUser && savedUser.phone === phone) {
            // 如果已存在该手机号的用户，更新其信息
            user = {
              ...savedUser,
              nickname: data.nickname || savedUser.nickname || '邻里用户',
              community: data.community || savedUser.community || '阳光社区',
              updated_at: Date.now(),
              last_active_at: Date.now()
            }
          } else {
            // 创建新用户
            user = {
              id: savedUser?.id || 'demo-user-' + Date.now(),
              phone: phone,
              nickname: data.nickname || savedUser?.nickname || '邻里用户',
              avatar: savedUser?.avatar || '',
              gender: savedUser?.gender,
              birthday: savedUser?.birthday || '',
              community: data.community || savedUser?.community || '阳光社区',
              address: savedUser?.address || '',
              bio: savedUser?.bio || '热爱社区，乐于助人',
              role: savedUser?.role || 'resident',
              credit_score: savedUser?.credit_score || 100,
              is_verified: true,
              created_at: savedUser?.created_at || Date.now(),
              updated_at: Date.now(),
              last_active_at: Date.now()
            }
          }

          // 保存用户信息到localStorage
          try {
            localStorage.setItem('userInfo', JSON.stringify(user))
          } catch (e) {
            console.error('保存用户信息失败', e)
          }

          // 获取该账号的用户数据（如果不存在则初始化空数据）
          const userData = getUserData(phone)

          resolve({
            token: 'mock-token-' + Date.now(),
            user,
            userData
          })
        }, 500)
      })
    }
    return post<{ token: string; user: User }>('/api/auth/login', data)
  }
}

export const userApi = {
  getProfile: () => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // 优先从localStorage读取
          try {
            const savedUserStr = localStorage.getItem('userInfo')
            if (savedUserStr) {
              resolve(JSON.parse(savedUserStr))
              return
            }
          } catch (e) {
            console.error('读取用户信息失败', e)
          }
          // 如果localStorage没有，返回mockUsers[0]
          resolve(mockUsers[0])
        }, 300)
      })
    }
    return get<User>('/api/user/profile')
  },

  updateProfile: (data: Partial<User>) => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // 优先更新localStorage中的用户信息
          try {
            const savedUserStr = localStorage.getItem('userInfo')
            if (savedUserStr) {
              const savedUser = JSON.parse(savedUserStr)
              const updatedUser = {
                ...savedUser,
                ...data,
                updated_at: Date.now()
              }
              localStorage.setItem('userInfo', JSON.stringify(updatedUser))
              // 同时更新mockUsers以保持一致性
              Object.assign(mockUsers[0], updatedUser)
              resolve(updatedUser)
              return
            }
          } catch (e) {
            console.error('更新用户信息失败', e)
          }
          // 如果localStorage没有，更新mockUsers[0]
          Object.assign(mockUsers[0], data, { updated_at: Date.now() })
          resolve(mockUsers[0])
        }, 300)
      })
    }
    return put<User>('/api/user/profile', data)
  },

  getMyPosts: (params?: { page?: number; limit?: number }) => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const myPosts = mockPosts.filter(p => p.user_id === '1')
          resolve({
            items: myPosts,
            page: params?.page || 1,
            limit: params?.limit || 10,
            total: myPosts.length,
            total_pages: 1
          })
        }, 300)
      })
    }
    return get<PaginatedResponse<Post>>('/api/user/posts', params)
  },

  getMyActivities: (params?: { page?: number; limit?: number }) => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            items: mockActivities,
            page: params?.page || 1,
            limit: params?.limit || 10,
            total: mockActivities.length,
            total_pages: 1
          })
        }, 300)
      })
    }
    return get<PaginatedResponse<Activity>>('/api/user/activities', params)
  },

  getMyFavorites: (params?: { page?: number; limit?: number }) => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            items: [],
            page: params?.page || 1,
            limit: params?.limit || 10,
            total: 0,
            total_pages: 1
          })
        }, 300)
      })
    }
    return get<PaginatedResponse<{ id: string; target_type: 'post' | 'comment' | 'activity'; target_id: string; created_at: number; target?: any }>>('/api/user/favorites', params)
  },

  toggleFavorite: (targetType: 'post' | 'comment' | 'activity', targetId: string) => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ favorited: true })
        }, 300)
      })
    }
    return post<{ favorited: boolean }>('/api/user/favorites', { target_type: targetType, target_id: targetId })
  },

  getOnlineUsers: () => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockUsers)
        }, 300)
      })
    }
    return get<User[]>('/api/users?online=true')
  }
}

export const activitiesApi = {
  getActivities: (params?: { page?: number; limit?: number; status?: string; category?: string; sort?: string; order?: string }) => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // 优先从用户独立数据读取
          const userData = getCurrentUserData()
          if (userData && userData.activities.length > 0) {
            resolve({
              items: userData.activities,
              pagination: {
                page: params?.page || 1,
                limit: params?.limit || 10,
                total: userData.activities.length,
                totalPages: 1
              }
            })
            return
          }
          // 如果没有用户数据，返回空数组
          resolve({
            items: [],
            pagination: {
              page: params?.page || 1,
              limit: params?.limit || 10,
              total: 0,
              totalPages: 1
            }
          })
        }, 300)
      })
    }
    return get<PaginatedData<Activity>>('/api/activities', params)
  },

  getActivity: (id: string) => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // 优先从用户独立数据读取
          const userData = getCurrentUserData()
          if (userData) {
            const activity = userData.activities.find((a: Activity) => a.id === id)
            if (activity) {
              resolve(activity)
              return
            }
          }
          // 如果没找到，返回 null
          resolve(null)
        }, 300)
      })
    }
    return get<Activity>(`/api/activities/${id}`)
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
  }) => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // 获取当前用户信息
          let currentUser = mockUsers[0]
          try {
            const savedUser = localStorage.getItem('userInfo')
            if (savedUser) {
              currentUser = JSON.parse(savedUser)
            }
          } catch (e) {
            console.error('读取用户信息失败', e)
          }

          const newActivity: Activity = {
            id: Date.now().toString(),
            user_id: currentUser.id || '1',
            title: data.title,
            description: data.description,
            category: data.category as any,
            location: data.location,
            start_time: new Date(data.start_time).getTime(),
            max_participants: data.max_participants,
            current_participants: 1,
            status: 'upcoming',
            created_at: Date.now(),
            updated_at: Date.now(),
            user: currentUser,
            is_participant: true
          }

          // 保存到用户独立数据
          const userData = getCurrentUserData()
          if (userData) {
            userData.activities.unshift(newActivity)
            saveCurrentUserData(userData)
          }
          resolve(newActivity)
        }, 300)
      })
    }
    return post<Activity>('/api/activities', data)
  },

  joinActivity: (id: string) => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // 更新用户独立数据中的活动
          const userData = getCurrentUserData()
          if (userData) {
            const activity = userData.activities.find(a => a.id === id)
            if (activity && !activity.is_participant) {
              activity.is_participant = true
              activity.current_participants++
              saveCurrentUserData(userData)
            }
          }
          resolve({
            id: Date.now().toString(),
            activity_id: id,
            user_id: '1',
            joined_at: Date.now(),
            status: 'registered'
          })
        }, 300)
      })
    }
    return post<ActivityParticipant>(`/api/activities/${id}/join`)
  },

  leaveActivity: (id: string) => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // 更新用户独立数据中的活动
          const userData = getCurrentUserData()
          if (userData) {
            const activity = userData.activities.find(a => a.id === id)
            if (activity && activity.is_participant) {
              activity.is_participant = false
              activity.current_participants--
              saveCurrentUserData(userData)
            }
          }
          resolve({ success: true })
        }, 300)
      })
    }
    return del(`/api/activities/${id}/leave`)
  },

  updateActivity: (id: string, data: Partial<{
    title: string
    description: string
    category: string
    location: string
    start_time: string
    end_time?: string
    max_participants?: number
    images?: string[]
    status?: string
  }>) => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const activity = mockActivities.find(a => a.id === id)
          if (activity) {
            Object.assign(activity, {
              ...data,
              start_time: data.start_time ? new Date(data.start_time).getTime() : activity.start_time,
              end_time: data.end_time ? new Date(data.end_time).getTime() : activity.end_time
            })
            resolve(activity)
          }
        }, 300)
      })
    }
    return put<Activity>(`/api/activities/${id}`, data)
  },

  deleteActivity: (id: string) => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const index = mockActivities.findIndex(a => a.id === id)
          if (index > -1) {
            mockActivities.splice(index, 1)
          }
          resolve({ id })
        }, 300)
      })
    }
    return del<{ id: string }>(`/api/activities/${id}`)
  }
}

export interface Task {
  id: string
  user_id: string
  helper_id?: string
  title: string
  description: string
  category: 'shopping' | 'delivery' | 'help' | 'companionship' | 'other'
  location: string
  reward?: string
  deadline?: number
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  created_at: number
  updated_at: number
  creator?: {
    id: string
    nickname: string
    avatar?: string
    credit_score: number
    is_verified: boolean
    community?: string
  }
  helper?: {
    id: string
    nickname: string
    avatar?: string
    credit_score: number
    is_verified: boolean
  }
}

export interface MatchUser {
  id: string
  name: string
  avatar?: string
  role?: string
  community?: string
  bio?: string
  rating: number
  distance: number
  completedTasks: number
  cancelledTasks?: number
  completionRate?: number
  isVerified: boolean
  isVolunteer?: boolean
  sameCommunity?: boolean
  tags: string[]
  matchScore?: number
  matchReasons?: string[]
}

export interface MatchResponse {
  matches: MatchUser[]
  total: number
}

export interface CreateTaskData {
  title: string
  description: string
  category?: 'shopping' | 'delivery' | 'help' | 'companionship' | 'other'
  location: string
  reward?: string
  deadline?: string
}

export interface UpdateTaskData {
  title?: string
  description?: string
  category?: 'shopping' | 'delivery' | 'help' | 'companionship' | 'other'
  location?: string
  reward?: string
  deadline?: string
}

export interface TaskActionData {
  action: 'accept' | 'complete' | 'cancel'
}

export interface MyTasksResponse {
  items: Task[]
  stats: {
    total: number
    published: {
      all: number
      pending: number
      in_progress: number
      completed: number
    }
    accepted: {
      all: number
      pending: number
      in_progress: number
      completed: number
    }
  }
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
  timestamp: number
}

export interface PaginatedData<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const tasksApi = {
  // 获取任务列表
  getTasks: (params?: {
    page?: number
    limit?: number
    status?: string
    category?: string
    user_id?: string
    helper_id?: string
    sort?: 'created_at' | 'deadline' | 'status' | 'category'
    order?: 'asc' | 'desc'
  }) => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            items: mockTasks,
            pagination: {
              page: params?.page || 1,
              limit: params?.limit || 10,
              total: mockTasks.length,
              totalPages: 1
            }
          })
        }, 300)
      })
    }
    return get<PaginatedData<Task>>('/api/tasks', params)
  },

  // 创建任务
  createTask: (data: CreateTaskData) => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newTask: Task = {
            id: Date.now().toString(),
            user_id: '1',
            title: data.title,
            description: data.description,
            category: data.category || 'other',
            location: data.location,
            reward: data.reward,
            status: 'pending',
            created_at: Date.now(),
            updated_at: Date.now(),
            creator: {
              id: '1',
              nickname: '阳光社区小李',
              avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
              credit_score: 95,
              is_verified: true,
              community: '阳光社区'
            }
          }
          mockTasks.unshift(newTask)
          resolve(newTask)
        }, 300)
      })
    }
    return post<Task>('/api/tasks', data)
  },

  // 获取任务详情
  getTask: (id: string) => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockTasks.find(t => t.id === id) || mockTasks[0])
        }, 300)
      })
    }
    return get<Task>(`/api/tasks/${id}`)
  },

  // 更新任务
  updateTask: (id: string, data: UpdateTaskData) => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const task = mockTasks.find(t => t.id === id)
          if (task) {
            Object.assign(task, data)
            resolve(task)
          }
        }, 300)
      })
    }
    return put<Task>(`/api/tasks/${id}`, data)
  },

  // 删除任务
  deleteTask: (id: string) => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const index = mockTasks.findIndex(t => t.id === id)
          if (index > -1) {
            mockTasks.splice(index, 1)
          }
          resolve({ id })
        }, 300)
      })
    }
    return del<{ id: string }>(`/api/tasks/${id}`)
  },

  // 接单
  acceptTask: (id: string) => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const task = mockTasks.find(t => t.id === id)
          if (task) {
            task.status = 'in_progress'
            task.helper_id = '1'
            task.helper = {
              id: '1',
              nickname: '阳光社区小李',
              avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
              credit_score: 95,
              is_verified: true
            }
            resolve(task)
          }
        }, 300)
      })
    }
    return post<Task>(`/api/tasks/${id}/accept`)
  },

  // 完成任务
  completeTask: (id: string) => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const task = mockTasks.find(t => t.id === id)
          if (task) {
            task.status = 'completed'
            resolve(task)
          }
        }, 300)
      })
    }
    return post<Task>(`/api/tasks/${id}/complete`)
  },

  // 任务操作（accept/complete/cancel）
  taskAction: (id: string, data: TaskActionData) => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const task = mockTasks.find(t => t.id === id)
          if (task) {
            if (data.action === 'cancel') {
              task.status = 'cancelled'
            }
            resolve(task)
          }
        }, 300)
      })
    }
    return post<Task>(`/api/tasks/${id}`, data)
  },

  // 获取我的任务
  getMyTasks: (params?: {
    page?: number
    limit?: number
    type?: 'all' | 'published' | 'accepted'
  }) => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            items: mockTasks,
            stats: {
              total: mockTasks.length,
              published: {
                all: 2,
                pending: 1,
                in_progress: 1,
                completed: 0
              },
              accepted: {
                all: 1,
                pending: 0,
                in_progress: 1,
                completed: 0
              }
            },
            pagination: {
              page: params?.page || 1,
              limit: params?.limit || 10,
              total: mockTasks.length,
              totalPages: 1
            }
          })
        }, 300)
      })
    }
    return get<MyTasksResponse>('/api/tasks/my', params)
  },

  // AI 匹配推荐
  getMatches: (params?: { task_id?: string; category?: string; limit?: number }) => {
    if (MOCK_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            matches: [
              {
                id: '2',
                name: '热心肠王阿姨',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
                role: 'volunteer',
                community: '阳光社区',
                bio: '社区志愿者，乐于助人',
                rating: 4.9,
                distance: 0.1,
                completedTasks: 56,
                completionRate: 98,
                isVerified: true,
                isVolunteer: true,
                sameCommunity: true,
                tags: ['热心', '准时', '细心'],
                matchScore: 98,
                matchReasons: ['同社区', '志愿者', '高评分']
              }
            ],
            total: 1
          })
        }, 300)
      })
    }
    return get<MatchResponse>('/api/tasks/match', params)
  }
}


