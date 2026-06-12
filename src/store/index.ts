import { ref, computed } from 'vue'
import type { User } from '../utils/api'
import {
  saveAuthInfo,
  clearAuthInfo,
  loadUserInfo,
  loadToken,
  loadUserData,
  saveUserData,
  getCurrentUserPhone,
  TASK_LIST_KEY,
  TASK_MY_CREATED_KEY,
  TASK_MY_ACCEPTED_KEY,
  HEALTH_RECORDS_KEY,
} from '../utils/storage'

// 用户级业务数据结构（不暴露外部，只通过 getter/setter 访问）
interface UserBusinessData {
  posts: any[]
  activities: any[]
  tasks: any[]
  myCreatedTasks: any[]
  myAcceptedTasks: any[]
  messages: any[]
  notifications: any[]
}

// 业务数据存储键（相对于 storage.ts 中的 baseKey）
const BUSINESS_KEYS = {
  userData: 'linli_user_data',
  posts: 'linli_posts',
  activities: 'linli_activities',
}

function initEmptyBusiness(): UserBusinessData {
  return {
    posts: [],
    activities: [],
    tasks: [],
    myCreatedTasks: [],
    myAcceptedTasks: [],
    messages: [],
    notifications: [],
  }
}

// ============== 响应式状态 ==============

const user = ref<User | null>(null)
const token = ref<string>('')
const userData = ref<UserBusinessData>(initEmptyBusiness())

/**
 * 把内存中的 userData 立即持久化到当前用户的独立 storage key
 * 任何修改后都应调用一次
 */
function persistUserData() {
  if (!user.value?.phone) return
  saveUserData<UserBusinessData>(BUSINESS_KEYS.userData, userData.value)
}

// ============== 对外 API ==============

export function useAuth() {
  const isLoggedIn = computed(() => !!token.value || !!user.value)

  /**
   * 页面/应用初始化：从 localStorage 读取登录态与该用户的业务数据
   * 关键：登录态是全局的（userInfo/token），但业务数据是按 phone 隔离的
   */
  function initAuth() {
    const savedToken = loadToken()
    const savedUser = loadUserInfo()

    if (savedToken) {
      token.value = savedToken
    } else {
      token.value = ''
    }

    if (savedUser) {
      user.value = savedUser
      // 读取该用户名下的独立业务数据（使用 storage.ts 的统一存储 API）
      const savedBusiness = loadUserData<UserBusinessData>(
        BUSINESS_KEYS.userData,
        null as any,
      )
      if (savedBusiness) {
        userData.value = savedBusiness
      } else {
        userData.value = initEmptyBusiness()
      }
    } else {
      user.value = null
      token.value = ''
      userData.value = initEmptyBusiness()
    }
  }

  /**
   * 登录成功：写入登录态并载入该用户的独立业务数据
   */
  function setUser(newUser: User, newToken: string, newUserData?: UserBusinessData) {
    user.value = newUser
    token.value = newToken
    saveAuthInfo(newUser, newToken)

    if (newUserData) {
      userData.value = newUserData
      persistUserData()
    } else {
      // 从该用户名下的独立存储读取（如果没有则用空对象）
      const saved = loadUserData<UserBusinessData>(BUSINESS_KEYS.userData, null as any)
      userData.value = saved || initEmptyBusiness()
    }
  }

  /**
   * 整体更新业务数据
   */
  function setUserData(data: UserBusinessData) {
    userData.value = data
    persistUserData()
  }

  /**
   * 登出：清空登录态 + 清空内存业务数据（不清其他用户的 localStorage）
   */
  function logout() {
    user.value = null
    token.value = ''
    userData.value = initEmptyBusiness()
    clearAuthInfo()
  }

  /**
   * 更新用户资料：内存 + localStorage 同时更新
   */
  function updateUser(partialUser: Partial<User>) {
    if (user.value) {
      user.value = { ...user.value, ...partialUser }
      // 同步更新 userInfo 的持久化内容，下次登录可见最新资料
      saveAuthInfo(user.value, token.value)
    }
  }

  return {
    user,
    token,
    userData,
    isLoggedIn,
    initAuth,
    setUser,
    setUserData,
    logout,
    updateUser,
    getCurrentPhone: () => user.value?.phone || getCurrentUserPhone(),
  }
}
