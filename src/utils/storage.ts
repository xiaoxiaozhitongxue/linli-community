// ============================================================================
// 统一存储层 - 基于当前登录用户的手机号实现账号数据隔离
// 所有业务数据的 localStorage 读写必须通过本模块，确保：
//   1. 不同账号数据完全独立（key = baseKey_{phone}）
//   2. 未登录时回退到 baseKey（全局命名空间，用于匿名态测试）
//   3. JSON 解析/序列化在本层内部完成，调用方不再接触 JSON 错误
//   4. 任何修改后立即落盘到 localStorage，下次登录自动读取最新状态
// ============================================================================

const USER_INFO_KEY = 'userInfo'
const TOKEN_KEY = 'token'

/**
 * 获取当前登录用户的手机号（用于构建用户隔离的 storage key）
 * 返回 null 表示未登录，此时读写操作会使用"全局命名空间"
 */
export function getCurrentUserPhone(): string | null {
  try {
    const raw = localStorage.getItem(USER_INFO_KEY)
    if (!raw) return null
    const info = JSON.parse(raw)
    return info?.phone || null
  } catch (e) {
    console.error('[storage] 读取当前用户手机号失败:', e)
    return null
  }
}

/**
 * 为当前登录用户构建专属 storage key
 * 规则：{baseKey}_{phone} ；如果未登录则返回 baseKey
 */
export function getUserStorageKey(baseKey: string): string {
  const phone = getCurrentUserPhone()
  if (phone) {
    return `${baseKey}_${phone}`
  }
  return baseKey
}

/**
 * 读取当前用户名下的某条业务数据（自动 JSON 解析）
 * @param baseKey 业务数据的基础键名（如 ai_helper_tasks）
 * @param defaultValue 当数据不存在或解析失败时返回的默认值
 */
export function loadUserData<T>(baseKey: string, defaultValue: T): T {
  const key = getUserStorageKey(baseKey)
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return defaultValue
    return JSON.parse(raw) as T
  } catch (e) {
    console.error(`[storage] 读取失败 [${key}]:`, e)
    return defaultValue
  }
}

/**
 * 写入当前用户名下的某条业务数据（立即落盘）
 * @param baseKey 业务数据的基础键名
 * @param data 任意可 JSON 序列化的数据对象
 */
export function saveUserData<T>(baseKey: string, data: T): void {
  const key = getUserStorageKey(baseKey)
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error(`[storage] 写入失败 [${key}]:`, e)
  }
}

/**
 * 原子更新：读取 → 应用 updater → 写回；简化"修改后立即保存"场景
 */
export function updateUserData<T>(
  baseKey: string,
  defaultValue: T,
  updater: (current: T) => T
): T {
  const current = loadUserData<T>(baseKey, defaultValue)
  const next = updater(current)
  saveUserData<T>(baseKey, next)
  return next
}

/**
 * 清理当前用户名下某条业务数据（用于删除场景）
 */
export function removeUserData(baseKey: string): void {
  const key = getUserStorageKey(baseKey)
  try {
    localStorage.removeItem(key)
  } catch (e) {
    console.error(`[storage] 移除失败 [${key}]:`, e)
  }
}

// ============================================================================
// 任务数据统一 API（取代原先各页面内重复实现的 loadFromStorage/saveToStorage）
// ============================================================================

export const TASK_LIST_KEY = 'ai_helper_tasks'
export const TASK_MY_CREATED_KEY = 'ai_helper_my_created_tasks'
export const TASK_MY_ACCEPTED_KEY = 'ai_helper_my_accepted_tasks'

export function loadTaskList<T>(defaultValue: T): T {
  return loadUserData<T>(TASK_LIST_KEY, defaultValue)
}

export function saveTaskList<T>(data: T): void {
  saveUserData<T>(TASK_LIST_KEY, data)
}

export function loadMyCreatedTasks<T>(defaultValue: T): T {
  return loadUserData<T>(TASK_MY_CREATED_KEY, defaultValue)
}

export function saveMyCreatedTasks<T>(data: T): void {
  saveUserData<T>(TASK_MY_CREATED_KEY, data)
}

export function loadMyAcceptedTasks<T>(defaultValue: T): T {
  return loadUserData<T>(TASK_MY_ACCEPTED_KEY, defaultValue)
}

export function saveMyAcceptedTasks<T>(data: T): void {
  saveUserData<T>(TASK_MY_ACCEPTED_KEY, data)
}

// ============================================================================
// 健康打卡记录
// ============================================================================

export const HEALTH_RECORDS_KEY = 'linli_health_records'

export function loadHealthRecords<T = any[]>(defaultValue: T = [] as unknown as T): T {
  return loadUserData<T>(HEALTH_RECORDS_KEY, defaultValue)
}

export function saveHealthRecords<T>(data: T): void {
  saveUserData<T>(HEALTH_RECORDS_KEY, data)
}

// ============================================================================
// 其他业务数据也通过 baseKey 方式扩展，保持一致
// ============================================================================

export function loadGeneric<T>(baseKey: string, defaultValue: T): T {
  return loadUserData<T>(baseKey, defaultValue)
}

export function saveGeneric<T>(baseKey: string, data: T): void {
  saveUserData<T>(baseKey, data)
}

// ============================================================================
// 认证相关（token / userInfo）使用全局 key，与业务数据隔离
// ============================================================================

export function saveAuthInfo(user: any, token: string): void {
  try {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(user))
    localStorage.setItem(TOKEN_KEY, token)
  } catch (e) {
    console.error('[storage] 保存认证信息失败:', e)
  }
}

export function clearAuthInfo(): void {
  try {
    localStorage.removeItem(USER_INFO_KEY)
    localStorage.removeItem(TOKEN_KEY)
  } catch (e) {
    console.error('[storage] 清除认证信息失败:', e)
  }
}

export function loadUserInfo(): any | null {
  try {
    const raw = localStorage.getItem(USER_INFO_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    console.error('[storage] 读取用户信息失败:', e)
    return null
  }
}

export function loadToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) || ''
  } catch (e) {
    return ''
  }
}

// ============================================================================
// 通用业务数据容器 —— 用于 api.ts 统一管理 tasks / activities / posts
// 结构：{ tasks: [...], activities: [...], posts: [...] }
// ============================================================================

const BUSINESS_KEY = 'linli_business_data'

export interface BusinessData {
  tasks: any[]
  activities: any[]
  posts: any[]
}

const DEFAULT_BUSINESS: BusinessData = {
  tasks: [],
  activities: [],
  posts: [],
}

export function loadBusiness(): BusinessData {
  return loadUserData<BusinessData>(BUSINESS_KEY, { ...DEFAULT_BUSINESS })
}

export function saveBusiness(data: BusinessData): void {
  saveUserData<BusinessData>(BUSINESS_KEY, data)
}

export function updateBusiness(updater: (current: BusinessData) => BusinessData): BusinessData {
  return updateUserData<BusinessData>(BUSINESS_KEY, { ...DEFAULT_BUSINESS }, updater)
}

// ============================================================================
// 便捷：获取当前登录用户完整信息（供页面/API层快速读取）
// ============================================================================

export function getCurrentUser(): any | null {
  return loadUserInfo()
}
