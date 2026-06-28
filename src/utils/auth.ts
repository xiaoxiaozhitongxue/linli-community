import { navigateTo } from './router'
import { showModal } from './ui'
import { useAuth } from '../store'

// 存储登录后的重定向路径
let loginRedirectPath: string | null = null

/**
 * 设置登录后的重定向路径
 */
export function setLoginRedirect(path: string) {
  loginRedirectPath = path
  // 同时存储到sessionStorage，防止页面刷新丢失
  try {
    sessionStorage.setItem('login_redirect', path)
  } catch (e) {
    console.error('存储重定向路径失败', e)
  }
}

/**
 * 获取并清除重定向路径
 */
export function getAndClearLoginRedirect(): string | null {
  let redirect = loginRedirectPath
  // 优先从sessionStorage恢复
  try {
    const stored = sessionStorage.getItem('login_redirect')
    if (stored) {
      redirect = stored
    }
  } catch (e) {
    console.error('读取重定向路径失败', e)
  }
  
  // 清除存储
  loginRedirectPath = null
  try {
    sessionStorage.removeItem('login_redirect')
  } catch (e) {
    console.error('清除重定向路径失败', e)
  }
  
  return redirect
}

/**
 * 检查是否已登录
 */
export function checkIsLoggedIn(): boolean {
  const { isLoggedIn } = useAuth()
  return isLoggedIn.value
}

/**
 * 处理需要登录的操作
 * 如果已登录，执行回调；如果未登录，弹出登录提示
 * @param action 未登录时要执行的操作（通常引导到登录页）
 * @param callback 已登录时要执行的回调
 */
export function requireAuth(action?: () => void, callback?: () => void) {
  const { isLoggedIn } = useAuth()
  
  if (isLoggedIn.value) {
    // 已登录，直接执行回调
    callback && callback()
  } else {
    // 未登录，显示登录引导
    showLoginGuide(action)
  }
}

/**
 * 显示登录引导弹窗
 */
export function showLoginGuide(afterLoginAction?: () => void) {
  // 保存当前路径用于登录后继续
  if (afterLoginAction) {
    // 获取当前页面路径作为重定向路径
    const currentPath = window.location.hash.replace('#', '') || '/pages/index/index'
    setLoginRedirect(currentPath)
  }
  
  showModal({
    title: '提示',
    content: '该功能需要登录后才能使用，是否前往登录？',
    confirmText: '去登录',
    cancelText: '取消',
    success: (res: { confirm: boolean }) => {
      if (res.confirm) {
        navigateTo('/pages/login/index')
      }
    }
  })
}

/**
 * 快速提示登录（轻量级提示，适用于点赞、评论等操作）
 */
export function quickLoginTip() {
  showModal({
    title: '提示',
    content: '请先登录后再进行操作',
    confirmText: '去登录',
    cancelText: '取消',
    success: (res: { confirm: boolean }) => {
      if (res.confirm) {
        navigateTo('/pages/login/index')
      }
    }
  })
}

/**
 * 为了兼容老版本命名，添加别名
 */
export { getAndClearLoginRedirect as getLoginRedirect }
