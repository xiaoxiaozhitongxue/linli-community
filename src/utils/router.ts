import { useRouter } from 'vue-router'
import { setLoginRedirect, getAndClearLoginRedirect } from './auth'

let routerInstance: any = null

// 返回路径栈 - 用于管理页面返回路径
interface PageRoute {
  path: string
  name?: string
  query?: Record<string, any>
  timestamp: number
}

const pageStack: PageRoute[] = []
const MAX_STACK_SIZE = 10 // 最多保存10条历史记录

// TabBar 页面列表 - 这些页面使用 switchTab 跳转
const TAB_BAR_PAGES = [
  '/pages/index/index',
  '/pages/ai-helper/index',
  '/pages/messages/index',
  '/pages/profile/index'
]

// 详情页/子页面试列表 - 这些页面返回时应该返回列表页
const DETAIL_PAGES = [
  '/pages/activities/detail',
  '/pages/ai-helper/detail',
  '/pages/profile/edit',
  '/pages/profile/my-posts',
  '/pages/profile/my-activities',
  '/pages/profile/my-favorites',
  '/pages/profile/my-tasks',
  '/pages/profile/notifications',
  '/pages/profile/privacy',
  '/pages/profile/about',
  '/pages/profile/settings'
]

export function setRouterInstance(router: any) {
  routerInstance = router
  
  // 设置路由守卫
  setupRouteGuard(router)
}

function ensureRouter() {
  if (!routerInstance) {
    console.error('Router 实例未初始化，请确保 main.ts 中已调用 setRouterInstance')
    return null
  }
  return routerInstance
}

/**
 * 判断是否为 TabBar 页面
 */
export function isTabBarPage(path: string): boolean {
  return TAB_BAR_PAGES.some(page => path.startsWith(page))
}

/**
 * 判断是否为详情页
 */
export function isDetailPage(path: string): boolean {
  return DETAIL_PAGES.some(page => path.startsWith(page))
}

/**
 * 获取列表页路径（用于详情页返回）
 */
export function getListPagePath(detailPath: string): string {
  if (detailPath.startsWith('/pages/activities/detail')) {
    return '/pages/activities/index'
  }
  if (detailPath.startsWith('/pages/ai-helper/detail')) {
    return '/pages/ai-helper/index'
  }
  if (detailPath.startsWith('/pages/profile/')) {
    return '/pages/profile/index'
  }
  return '/pages/index/index'
}

/**
 * 记录页面访问历史
 */
export function recordPageVisit(path: string, query?: Record<string, any>) {
  // 避免重复记录相同页面（连续点击）
  const lastVisit = pageStack[pageStack.length - 1]
  if (lastVisit && lastVisit.path === path && JSON.stringify(lastVisit.query) === JSON.stringify(query)) {
    return
  }
  
  pageStack.push({
    path,
    query,
    timestamp: Date.now()
  })
  
  // 限制栈大小
  if (pageStack.length > MAX_STACK_SIZE) {
    pageStack.shift()
  }
}

/**
 * 获取上一页路径
 */
export function getPreviousPagePath(): string | null {
  if (pageStack.length < 2) {
    return null
  }
  // 返回栈中倒数第二个页面（跳过当前页）
  const previous = pageStack[pageStack.length - 2]
  return previous?.path || null
}

/**
 * 清除页面访问历史
 */
export function clearPageHistory() {
  pageStack.length = 0
}

/**
 * 普通页面跳转 - 保留当前页面到历史记录
 */
export function navigateTo(url: string, query?: Record<string, any>) {
  const router = ensureRouter()
  if (router) {
    router.push({ path: url, query }).catch((err: any) => {
      if (err.name !== 'NavigationDuplicated' && err.name !== 'NavigationCancelled') {
        console.error('导航失败', err)
      }
    })
  }
}

/**
 * TabBar 页面跳转 - 切换到底部导航，不保留当前页到历史记录
 * 用于底部导航栏点击
 */
export function switchTab(url: string) {
  const router = ensureRouter()
  if (router) {
    // 切换 tabBar 时清除历史记录栈，因为 tabBar 页面是根级别
    clearPageHistory()
    
    router.push(url).catch((err: any) => {
      if (err.name !== 'NavigationDuplicated' && err.name !== 'NavigationCancelled') {
        console.error('TabBar 切换失败', err)
      }
    })
  }
}

/**
 * replace 跳转 - 替换当前页面，不保留到历史记录
 * 用于登录页等不需要返回的页面
 */
export function redirectTo(url: string) {
  const router = ensureRouter()
  if (router) {
    router.replace(url).catch((err: any) => {
      if (err.name !== 'NavigationDuplicated' && err.name !== 'NavigationCancelled') {
        console.error('重定向失败', err)
      }
    })
  }
}

/**
 * 智能返回 - 根据当前页面类型智能选择返回行为
 * - 详情页返回列表页
 * - 普通页面返回上一页
 * - 如果没有历史记录，返回首页或指定页面
 */
export function navigateBackSmart(fallbackPath: string = '/pages/index/index') {
  const router = ensureRouter()
  if (!router) return
  
  const currentPath = router.currentRoute.value.path
  
  // 如果是详情页，尝试返回列表页
  if (isDetailPage(currentPath)) {
    const listPath = getListPagePath(currentPath)
    router.replace(listPath).catch((err: any) => {
      if (err.name !== 'NavigationDuplicated') {
        console.error('返回失败', err)
      }
    })
    return
  }
  
  // 如果有历史记录，尝试返回
  const previousPath = getPreviousPagePath()
  if (previousPath) {
    // 如果上一页是 tabBar 页面，使用 replace
    if (isTabBarPage(previousPath)) {
      router.replace(previousPath).catch((err: any) => {
        if (err.name !== 'NavigationDuplicated') {
          console.error('返回失败', err)
        }
      })
    } else {
      // 否则正常返回
      router.back()
    }
    // 移除当前页记录
    pageStack.pop()
    return
  }
  
  // 没有历史记录，返回首页
  router.replace(fallbackPath).catch((err: any) => {
    if (err.name !== 'NavigationDuplicated') {
      console.error('返回失败', err)
    }
  })
}

/**
 * 标准返回 - 使用浏览器原生的返回功能，如果失败则使用智能返回
 */
export function navigateBack(delta: number = 1) {
  const router = ensureRouter()
  if (router) {
    // 尝试使用浏览器历史返回
    try {
      router.go(-delta)
    } catch (e) {
      // 如果失败（比如没有历史记录），使用智能返回
      console.warn('浏览器历史返回失败，使用智能返回')
      navigateBackSmart()
    }
  }
}

/**
 * 跳转到详情页 - 自动记录来源页面
 */
export function navigateToDetail(detailPath: string, query?: Record<string, any>) {
  navigateTo(detailPath, query)
}

// ============ 路由守卫 ============

// 需要登录才能访问的页面
const AUTH_REQUIRED_PAGES = [
  '/pages/post/create',
  '/pages/activities/create',
  '/pages/ai-helper/publish',
  '/pages/profile/edit',
  '/pages/profile/my-posts',
  '/pages/profile/my-activities',
  '/pages/profile/my-favorites',
  '/pages/profile/my-tasks',
  '/pages/profile/notifications'
]

// 登录页路径
const LOGIN_PAGE = '/pages/login/index'

// 公开页面（无需登录）
const PUBLIC_PAGES = [
  '/pages/index/index',
  '/pages/login/index',
  '/pages/health/index',
  '/pages/ai-helper/index',
  '/pages/elderly/index',
  '/pages/messages/chat',
  '/pages/messages/group'
]

function setupRouteGuard(router: any) {
  // 获取 auth store（延迟加载避免循环依赖）
  let getAuthState: (() => { isLoggedIn: boolean }) | null = null
  
  const loadAuthHook = () => {
    if (!getAuthState) {
      try {
        // 尝试从 store 获取 auth 状态
        const { useAuth } = require('../store')
        getAuthState = () => {
          const auth = useAuth()
          return {
            isLoggedIn: auth.isLoggedIn?.value || false
          }
        }
      } catch (e) {
        console.warn('无法加载 auth store，登录状态检查将被跳过')
        getAuthState = () => ({ isLoggedIn: true }) // 默认放行
      }
    }
    return getAuthState()
  }
  
  router.beforeEach((to: any, from: any, next: any) => {
    const { isLoggedIn } = loadAuthHook()
    const toPath = to.path
    const fromPath = from.path
    
    // 记录页面访问历史（排除 tabBar 切换）
    if (!isTabBarPage(toPath) || !isTabBarPage(fromPath)) {
      recordPageVisit(toPath, to.query)
    }
    
    // 检查是否需要登录
    const requiresAuth = AUTH_REQUIRED_PAGES.some(page => toPath.startsWith(page))
    
    if (requiresAuth && !isLoggedIn) {
      // 未登录，重定向到登录页，并记录当前路径用于登录后返回
      const redirectPath = toPath + (to.fullPath.includes('?') ? '?' + to.fullPath.split('?')[1] : '')
      setLoginRedirect(redirectPath)
      next({ path: LOGIN_PAGE, replace: true })
      return
    }
    
    // 移除自动跳转登录页的逻辑，让用户可以手动访问登录页进行测试

    
    next()
  })
  
  // 页面切换后的处理
  router.afterEach((to: any, from: any) => {
    // 可以在这里添加页面埋码等逻辑
    console.log('页面跳转:', from.path, '->', to.path)
  })
}

/**
 * 获取当前用户的专属存储键
 * 根据登录用户的手机号构建独立的存储键，确保多账号数据隔离
 * @param baseKey 基础存储键名
 * @returns 用户专属的存储键名 {baseKey}_{phone}，未登录时返回 baseKey
 */
export function getUserStorageKey(baseKey: string): string {
  try {
    const userInfoStr = localStorage.getItem('userInfo')
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr)
      if (userInfo && userInfo.phone) {
        return `${baseKey}_${userInfo.phone}`
      }
    }
  } catch (e) {
    console.error(`获取用户存储键失败 (${baseKey}):`, e)
  }
  return baseKey
}

// 导出 auth.ts 中的重定向路径管理函数
export { setLoginRedirect, getAndClearLoginRedirect } from './auth'
