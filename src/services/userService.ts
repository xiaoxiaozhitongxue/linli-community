import { get, put } from '../utils/request'
import type { User, Post, Activity, PaginatedResponse } from '../types/models'
import type {
  UpdateProfileRequest,
  OnlineUsersResponse,
  TaskStats
} from '../types/api'

/**
 * 用户相关服务：档案、我的发布、我的活动、在线用户等。
 * 从原 src/utils/api.ts 的 userApi 迁移而来，统一走 service 层。
 */
export const userService = {
  getProfile: (): Promise<User> => get<User>('/api/user/profile', undefined, { showError: true }).then((r) => r.data),

  updateProfile: (partial: UpdateProfileRequest): Promise<User> =>
    put<User>('/api/user/profile', partial, { showError: true }).then((r) => r.data),

  getMyPosts: (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Post>> =>
    get<PaginatedResponse<Post>>('/api/user/posts', params).then((r) => r.data),

  getMyActivities: (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Activity>> =>
    get<PaginatedResponse<Activity>>('/api/user/activities', params).then((r) => r.data),

  getTaskStats: (): Promise<TaskStats> =>
    get<{ stats: TaskStats }>('/api/tasks/my')
      .then((r) => (r.data && r.data.stats) || { published: 0, accepted: 0, total: 0 })
      .catch(() => ({ published: 0, accepted: 0, total: 0 })),

  getOnlineUsers: (): Promise<User[]> =>
    get<OnlineUsersResponse>('/api/users', { online: '1', limit: 20 })
      .then((r) => {
        const items = (r.data && r.data.items) || []
        return items.map((u: User) => ({ ...u, is_online: true }))
      })
      .catch(() => [])
}
