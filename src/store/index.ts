import { ref, computed } from 'vue'
import type { User } from '../utils/api'

const user = ref<User | null>(null)
const token = ref<string>('')

function safeGetStorage(key: string) {
  try {
    const value = localStorage.getItem(key)
    if (!value) return null
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  } catch (e) {
    console.error(`获取 localStorage 失败: ${key}`, e)
    return null
  }
}

function safeSetStorage(key: string, value: any) {
  try {
    const strValue = typeof value === 'string' ? value : JSON.stringify(value)
    localStorage.setItem(key, strValue)
  } catch (e) {
    console.error(`设置 localStorage 失败: ${key}`, e)
  }
}

function safeRemoveStorage(key: string) {
  try {
    localStorage.removeItem(key)
  } catch (e) {
    console.error(`移除 localStorage 失败: ${key}`, e)
  }
}

export function useAuth() {
  const isLoggedIn = computed(() => !!token.value || !!user.value)

  function initAuth() {
    const savedToken = safeGetStorage('token')
    const savedUser = safeGetStorage('userInfo')
    
    if (savedToken) {
      token.value = savedToken
    }
    
    if (savedUser) {
      user.value = savedUser
    }
  }

  function setUser(newUser: User, newToken: string) {
    user.value = newUser
    token.value = newToken
    safeSetStorage('token', newToken)
    safeSetStorage('userInfo', newUser)
  }

  function logout() {
    user.value = null
    token.value = ''
    safeRemoveStorage('token')
    safeRemoveStorage('userInfo')
  }

  function updateUser(partialUser: Partial<User>) {
    if (user.value) {
      user.value = { ...user.value, ...partialUser }
      safeSetStorage('userInfo', user.value)
    }
  }

  return {
    user,
    token,
    isLoggedIn,
    initAuth,
    setUser,
    logout,
    updateUser
  }
}
