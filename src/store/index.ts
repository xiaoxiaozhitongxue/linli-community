import { ref, computed } from 'vue'
import type { User } from '../utils/api'

// 用户数据结构
interface UserData {
  posts: any[]
  activities: any[]
  tasks: any[]
  myCreatedTasks: any[]
  myAcceptedTasks: any[]
  messages: any[]
  notifications: any[]
}

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

// 获取用户数据键名
function getUserDataKey(phone: string): string {
  return `linli_user_data_${phone}`
}

// 初始化用户数据
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

  function initAuth() {
    const savedToken = safeGetStorage('token')
    const savedUser = safeGetStorage('userInfo')
    
    if (savedToken) {
      token.value = savedToken
    }
    
    if (savedUser) {
      user.value = savedUser
      // 加载该用户的独立数据
      const userDataKey = getUserDataKey(savedUser.phone)
      const savedUserData = safeGetStorage(userDataKey)
      if (savedUserData) {
        userData.value = savedUserData
      } else {
        userData.value = initUserData()
      }
    }
  }

  function setUser(newUser: User, newToken: string, newUserData?: UserData) {
    user.value = newUser
    token.value = newToken
    safeSetStorage('token', newToken)
    safeSetStorage('userInfo', newUser)
    
    // 保存用户独立数据
    if (newUserData) {
      userData.value = newUserData
      safeSetStorage(getUserDataKey(newUser.phone), newUserData)
    }
  }

  function setUserData(data: UserData) {
    userData.value = data
    if (user.value) {
      safeSetStorage(getUserDataKey(user.value.phone), data)
    }
  }

  function logout() {
    user.value = null
    token.value = ''
    userData.value = initUserData()
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
    userData,
    isLoggedIn,
    initAuth,
    setUser,
    setUserData,
    logout,
    updateUser,
    // 导出获取当前用户手机号的函数，供 api.ts 使用
    getCurrentPhone: () => user.value?.phone || null
  }
}
