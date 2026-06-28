import { ref, computed } from 'vue'
import type { User } from '../types/models'
import type { UserData, AuthState } from '../types/store'

const user = ref<User | null>(null)
const token = ref<string>('')
const userData = ref<UserData>({
  posts: [],
  activities: [],
  tasks: [],
  myCreatedTasks: [],
  myAcceptedTasks: [],
  messages: [],
  notifications: []
})

// --- 工具：安全读取/写入 ---
function safeGet<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return defaultValue
    try {
      return JSON.parse(raw) as T
    } catch {
      return defaultValue
    }
  } catch (e) {
    console.error(`[store] 读取失败 [${key}]:`, e)
    return defaultValue
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    const str = typeof value === 'string' ? value : JSON.stringify(value)
    localStorage.setItem(key, str)
  } catch (e) {
    console.error(`[store] 写入失败 [${key}]:`, e)
  }
}

function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (e) {
    console.error(`[store] 移除失败 [${key}]:`, e)
  }
}

const USER_INFO_KEY = 'userInfo'
const TOKEN_KEY = 'token'

// --- 独立工具函数（安全，不依赖 reactive 上下文）---

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_INFO_KEY)
    if (!raw) return null
    const u = JSON.parse(raw)
    if (!u || !u.phone) return null
    return u
  } catch {
    return null
  }
}

export function isLoggedIn(): boolean {
  return !!getCurrentUser()
}

export function onLoginSuccess(newUser: User, newToken: string): void {
  safeSet(USER_INFO_KEY, newUser)
  safeSet(TOKEN_KEY, newToken)
}

export function onLogout(): void {
  safeRemove(TOKEN_KEY)
  safeRemove(USER_INFO_KEY)
}

// --- 用户数据键名 ---
function getUserDataKey(phone: string): string {
  return `linli_user_data_${phone}`
}

function initUserData(): UserData {
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

export function useAuth() {
  const isLoggedIn = computed(() => !!token.value || !!user.value)

  function initAuth(): void {
    const savedToken = safeGet<string>(TOKEN_KEY, '')
    const savedUser = safeGet<User | null>(USER_INFO_KEY, null)

    if (savedToken) {
      token.value = savedToken
    }

    if (savedUser) {
      user.value = savedUser
      const userDataKey = getUserDataKey(savedUser.phone)
      const savedUserData = safeGet<UserData>(userDataKey, initUserData())
      userData.value = savedUserData
    }
  }

  function setUser(newUser: User, newToken: string, newUserData?: UserData): void {
    user.value = newUser
    token.value = newToken
    safeSet(TOKEN_KEY, newToken)
    safeSet(USER_INFO_KEY, newUser)

    if (newUserData) {
      userData.value = newUserData
      safeSet(getUserDataKey(newUser.phone), newUserData)
    }
  }

  function setUserData(data: UserData): void {
    userData.value = data
    if (user.value) {
      safeSet(getUserDataKey(user.value.phone), data)
    }
  }

  function logout(): void {
    onLogout()
    user.value = null
    token.value = ''
    userData.value = initUserData()
  }

  function updateUser(partialUser: Partial<User>): void {
    if (user.value) {
      user.value = { ...user.value, ...partialUser }
      safeSet(USER_INFO_KEY, user.value)
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
    getCurrentPhone: (): string | null => user.value?.phone || null
  }
}

export type { UserData }

// ==========================================================================
//  安全调用说明
//  ============
//  getCurrentUser()   → 可在任何地方安全调用（组件 / api.ts / router），
//                        直接读 localStorage，不依赖 Vue reactive 上下文。
//  isLoggedIn()       → 同上，无 reactive 依赖。
//  onLoginSuccess()   → 登录成功后调用，写入 token + userInfo 到 localStorage。
//  onLogout()         → 登出时调用，清除 token + userInfo。
//
//  useAuth()          → 仅在 setup() / <script setup> 中调用，返回 reactive 状态。
//                       其返回的 isLoggedIn 是 ComputedRef，需通过 .value 访问。
// ==========================================================================
