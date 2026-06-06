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
  user: User
  is_participant?: boolean
  participants?: User[]
}

export interface ActivityParticipant {
  id: string
  activity_id: string
  user_id: string
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

export const postsApi = {
  getPosts: (params?: { page?: number; limit?: number; sort?: string; order?: string; user_id?: string }) => {
    return get<PaginatedResponse<Post>>('/api/posts', params)
  },

  createPost: (data: { content: string; images?: string[]; location?: string; visibility?: string }) => {
    return post<Post>('/api/posts', data)
  },

  likePost: (postId: string) => {
    return post<LikeResponse>(`/api/posts/${postId}/like`)
  },

  getComments: (postId: string, params?: { page?: number; limit?: number }) => {
    return get<PaginatedResponse<Comment>>(`/api/posts/${postId}/comments`, params)
  },

  createComment: (postId: string, data: { content: string; parent_comment_id?: string }) => {
    return post<Comment>(`/api/posts/${postId}/comments`, data)
  }
}

export const authApi = {
  login: (data: { code: string }) => {
    return post<{ token: string; user: User }>('/api/auth/login', data)
  }
}

export const userApi = {
  getProfile: () => {
    return get<User>('/api/user/profile')
  },

  updateProfile: (data: Partial<User>) => {
    return put<User>('/api/user/profile', data)
  },

  getMyPosts: (params?: { page?: number; limit?: number }) => {
    return get<PaginatedResponse<Post>>('/api/user/posts', params)
  },

  getMyActivities: (params?: { page?: number; limit?: number }) => {
    return get<PaginatedResponse<Activity>>('/api/user/activities', params)
  },

  getMyFavorites: (params?: { page?: number; limit?: number }) => {
    return get<PaginatedResponse<{ id: string; target_type: 'post' | 'comment' | 'activity'; target_id: string; created_at: number; target?: any }>>('/api/user/favorites', params)
  },

  toggleFavorite: (targetType: 'post' | 'comment' | 'activity', targetId: string) => {
    return post<{ favorited: boolean }>('/api/user/favorites', { target_type: targetType, target_id: targetId })
  },

  getOnlineUsers: () => {
    return get<User[]>('/api/users?online=true')
  }
}

export const activitiesApi = {
  getActivities: (params?: { page?: number; limit?: number; status?: string; category?: string }) => {
    return get<PaginatedResponse<Activity>>('/api/activities', params)
  },

  getActivity: (id: string) => {
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
    return post<Activity>('/api/activities', data)
  },

  joinActivity: (id: string) => {
    return post<ActivityParticipant>(`/api/activities/${id}/join`)
  },

  leaveActivity: (id: string) => {
    return del(`/api/activities/${id}/leave`)
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
    return get<PaginatedData<Task>>('/api/tasks', params)
  },

  // 创建任务
  createTask: (data: CreateTaskData) => {
    return post<Task>('/api/tasks', data)
  },

  // 获取任务详情
  getTask: (id: string) => {
    return get<Task>(`/api/tasks/${id}`)
  },

  // 更新任务
  updateTask: (id: string, data: UpdateTaskData) => {
    return put<Task>(`/api/tasks/${id}`, data)
  },

  // 删除任务
  deleteTask: (id: string) => {
    return del<{ id: string }>(`/api/tasks/${id}`)
  },

  // 接单
  acceptTask: (id: string) => {
    return post<Task>(`/api/tasks/${id}/accept`)
  },

  // 完成任务
  completeTask: (id: string) => {
    return post<Task>(`/api/tasks/${id}/complete`)
  },

  // 任务操作（accept/complete/cancel）
  taskAction: (id: string, data: TaskActionData) => {
    return post<Task>(`/api/tasks/${id}`, data)
  },

  // 获取我的任务
  getMyTasks: (params?: {
    page?: number
    limit?: number
    type?: 'all' | 'published' | 'accepted'
  }) => {
    return get<MyTasksResponse>('/api/tasks/my', params)
  },

  // AI 匹配推荐
  getMatches: (params?: { task_id?: string; category?: string; limit?: number }) => {
    return get<MatchResponse>('/api/tasks/match', params)
  }
}

export const neighborhoodApi = {
  getTopics: (): Promise<Topic[]> => {
    return Promise.resolve([
      { id: '1', name: '遛狗心得', posts: 156, participants: 89, emoji: '🐕' },
      { id: '2', name: '美食分享', posts: 234, participants: 123, emoji: '🍜' },
      { id: '3', name: '带娃经验', posts: 189, participants: 67, emoji: '👶' },
      { id: '4', name: '二手闲置', posts: 456, participants: 234, emoji: '📦' }
    ])
  },

  getChatRooms: (): Promise<ChatRoom[]> => {
    return Promise.resolve([
      { id: '1', name: '宝爸宝妈群', emoji: '👶', description: '育儿经验分享', members: 234, today_messages: 89, bg_color: '#FFE0B2' },
      { id: '2', name: '宠物交流群', emoji: '🐕', description: '遛狗、宠物用品', members: 189, today_messages: 67, bg_color: '#C8E6C9' },
      { id: '3', name: '美食烹饪群', emoji: '🍳', description: '私房菜、烘焙', members: 312, today_messages: 123, bg_color: '#BBDEFB' },
      { id: '4', name: '运动健身群', emoji: '🏃', description: '跑步、瑜伽、健身', members: 145, today_messages: 45, bg_color: '#F8BBD9' }
    ])
  },

  getInterestGroups: (): Promise<InterestGroup[]> => {
    return Promise.resolve([
      { id: '1', name: '萌宠联盟', members: 234, emoji: '🐕', bg_color: '#E8F5E9', is_joined: true },
      { id: '2', name: '美食烹饪', members: 456, emoji: '🍳', bg_color: '#FFF3E0', is_joined: false },
      { id: '3', name: '运动健身', members: 189, emoji: '🏃', bg_color: '#E3F2FD', is_joined: true },
      { id: '4', name: '读书会', members: 123, emoji: '📚', bg_color: '#FCE4EC', is_joined: false },
      { id: '5', name: '手工DIY', members: 167, emoji: '🎨', bg_color: '#F3E5F5', is_joined: false },
      { id: '6', name: '绿植养护', members: 98, emoji: '🌱', bg_color: '#E0F2F1', is_joined: false }
    ])
  },

  joinGroup: (groupId: string): Promise<{ success: boolean }> => {
    return Promise.resolve({ success: true })
  },

  leaveGroup: (groupId: string): Promise<{ success: boolean }> => {
    return Promise.resolve({ success: true })
  }
}
