// ==========================================================================
//  [已废弃] 统一 API 层（src/utils/api.ts）
// ==========================================================================
//
//  该文件已被废除，所有业务请求请迁移到 `src/services/*`：
//    - authService      (登录/注册/登出)
//    - userService       (用户档案/我的发布/我的活动/在线用户)
//    - postService       (邻里动态/评论/点赞)
//    - activityService    (活动中心)
//    - taskService        (互助任务)
//    - healthService      (健康打卡)
//
//  请求底层封装见 `src/utils/request.ts`。
//  加载本文件不会再暴露任何可用 API 对象——若仍有代码 import 这里的内容，
//  请在编译/运行时明确报错以便定位并清理。
// ==========================================================================

import { authService } from '../services/authService'
import { userService } from '../services/userService'
import { postService } from '../services/postService'
import { activityService } from '../services/activityService'
import { taskService } from '../services/taskService'
import { healthService } from '../services/healthService'

/* eslint-disable @typescript-eslint/no-explicit-any */
const DEPRECATED = (name: string): any => {
  throw new Error(
    `[api.ts] 已废弃：'${name}' 已从 src/utils/api.ts 移除，请改用 src/services/* 中的对应服务。`
  )
}

/** @deprecated 使用 authService */
export const authApi = {
  login: (...args: any[]) => DEPRECATED('authApi.login'),
  logout: (...args: any[]) => DEPRECATED('authApi.logout'),
  register: (...args: any[]) => DEPRECATED('authApi.register')
}

/** @deprecated 使用 userService */
export const userApi = {
  getProfile: (...args: any[]) => DEPRECATED('userApi.getProfile'),
  updateProfile: (...args: any[]) => DEPRECATED('userApi.updateProfile'),
  getMyPosts: (...args: any[]) => DEPRECATED('userApi.getMyPosts'),
  getMyActivities: (...args: any[]) => DEPRECATED('userApi.getMyActivities'),
  getTaskStats: (...args: any[]) => DEPRECATED('userApi.getTaskStats'),
  getOnlineUsers: (...args: any[]) => DEPRECATED('userApi.getOnlineUsers')
}

/** @deprecated 使用 postService */
export const postsApi = {
  getPosts: (...args: any[]) => DEPRECATED('postsApi.getPosts'),
  getPost: (...args: any[]) => DEPRECATED('postsApi.getPost'),
  createPost: (...args: any[]) => DEPRECATED('postsApi.createPost'),
  likePost: (...args: any[]) => DEPRECATED('postsApi.likePost'),
  deletePost: (...args: any[]) => DEPRECATED('postsApi.deletePost'),
  getComments: (...args: any[]) => DEPRECATED('postsApi.getComments'),
  createComment: (...args: any[]) => DEPRECATED('postsApi.createComment')
}

/** @deprecated 使用 activityService */
export const activitiesApi = {
  getActivities: (...args: any[]) => DEPRECATED('activitiesApi.getActivities'),
  getActivity: (...args: any[]) => DEPRECATED('activitiesApi.getActivity'),
  createActivity: (...args: any[]) => DEPRECATED('activitiesApi.createActivity'),
  joinActivity: (...args: any[]) => DEPRECATED('activitiesApi.joinActivity'),
  leaveActivity: (...args: any[]) => DEPRECATED('activitiesApi.leaveActivity'),
  updateActivity: (...args: any[]) => DEPRECATED('activitiesApi.updateActivity'),
  deleteActivity: (...args: any[]) => DEPRECATED('activitiesApi.deleteActivity')
}

/** @deprecated 使用 taskService */
export const tasksApi = {
  getTasks: (...args: any[]) => DEPRECATED('tasksApi.getTasks'),
  getTask: (...args: any[]) => DEPRECATED('tasksApi.getTask'),
  createTask: (...args: any[]) => DEPRECATED('tasksApi.createTask'),
  acceptTask: (...args: any[]) => DEPRECATED('tasksApi.acceptTask'),
  completeTask: (...args: any[]) => DEPRECATED('tasksApi.completeTask'),
  cancelTask: (...args: any[]) => DEPRECATED('tasksApi.cancelTask'),
  updateTask: (...args: any[]) => DEPRECATED('tasksApi.updateTask'),
  deleteTask: (...args: any[]) => DEPRECATED('tasksApi.deleteTask'),
  getMyTasks: (...args: any[]) => DEPRECATED('tasksApi.getMyTasks')
}

/** @deprecated 使用 healthService */
export const healthApi = {
  getRecords: (...args: any[]) => DEPRECATED('healthApi.getRecords'),
  addRecord: (...args: any[]) => DEPRECATED('healthApi.addRecord')
}

// 保留对 service 的引用，避免某些工具误判本模块为未使用而整段删除（同时也便于未来彻底移除）
void authService
void userService
void postService
void activityService
void taskService
void healthService
