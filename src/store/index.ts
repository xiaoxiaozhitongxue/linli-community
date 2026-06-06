import { ref, computed } from 'vue'
import type { User } from '../utils/api'

const user = ref<User | null>(null)
const token = ref<string>('')

export function useAuth() {
  const isLoggedIn = computed(() => !!token.value || !!user.value)

  function initAuth() {
    try {
      const savedToken = uni.getStorageSync('token')
      const savedUser = uni.getStorageSync('userInfo')
      
      if (savedToken) {
        token.value = savedToken
      }
      
      if (savedUser) {
        user.value = savedUser
      }
    } catch (e) {
      console.error('初始化认证状态失败:', e)
    }
  }

  function setUser(newUser: User, newToken: string) {
    user.value = newUser
    token.value = newToken
    
    try {
      uni.setStorageSync('token', newToken)
      uni.setStorageSync('userInfo', newUser)
    } catch (e) {
      console.error('保存用户信息失败:', e)
    }
  }

  function logout() {
    user.value = null
    token.value = ''
    
    try {
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
    } catch (e) {
      console.error('清除用户信息失败:', e)
    }
  }

  function updateUser(partialUser: Partial<User>) {
    if (user.value) {
      user.value = { ...user.value, ...partialUser }
      
      try {
        uni.setStorageSync('userInfo', user.value)
      } catch (e) {
        console.error('更新用户信息失败:', e)
      }
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
