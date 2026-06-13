// ==========================================================================
//  统一数据存储层（前端 "后端"）
// ==========================================================================
//
//  设计原则
//  --------
//  1. 所有业务数据（posts/activities/tasks/...）**只通过本文件读写**
//  2. 用户身份隔离：存储键 = baseKey + "_" + phone（手机号是稳定身份标识）
//  3. 鉴权：写入/删除/修改操作必须携带当前登录用户的 phone+id，校验 owner 后才允许
//  4. 数据立即落盘：任何变更都立即同步到 localStorage，页面刷新/切换后仍在
//  5. 隔离边界：
//       - 未登录：返回空数据，禁止写操作
//       - 登录用户 A：只能读写 A 名下的 business_data_A
//       - 登录用户 B：只能读写 B 名下的 business_data_B
//
//  存储结构
//  --------
//    userInfo                → 当前登录用户信息（全局唯一，"正在用哪个账号"）
//    token                   → 当前登录 token（登录凭证）
//    linli_business_data_    → 业务数据（按手机号后缀隔离）
//        {
//          posts:        Post[]
//          activities:   Activity[]
//          tasks:        Task[]
//          updated_at:   number
//        }
//    linli_health_records_   → 健康打卡记录（同样按手机号隔离）
//
//  调用顺序
//  --------
//  各页面通过 api.ts → tasksApi/postsApi/activitiesApi/userApi
//    → 本模块的 getCurrentUser() + loadBusiness() + saveBusiness()
//
// ==========================================================================

import type { User } from './api'

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
    console.error(`[storage] 读取失败 [${key}]:`, e)
    return defaultValue
  }
}

function safeSet(key: string, value: any): void {
  try {
    const str = typeof value === 'string' ? value : JSON.stringify(value)
    localStorage.setItem(key, str)
  } catch (e) {
    console.error(`[storage] 写入失败 [${key}]:`, e)
  }
}

function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (e) {
    console.error(`[storage] 移除失败 [${key}]:`, e)
  }
}

// ========================================================================
//  登录态（Auth）
// ========================================================================
const USER_INFO_KEY = 'userInfo'
const TOKEN_KEY = 'token'

/**
 * 获取当前登录用户（从 userInfo 这条 "正在使用哪个账号" 的指针获取）
 * 只有登录状态下才返回非 null。
 */
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

export function getCurrentPhone(): string | null {
  const u = getCurrentUser()
  return u?.phone ?? null
}

export function isLoggedIn(): boolean {
  return !!getCurrentUser()
}

/**
 * 登录成功后：写入 userInfo + token + 初始化该账号的业务数据
 * 保证：每个手机号对应独立存储空间，切换账号不会互相干扰
 */
export function onLoginSuccess(user: User, token: string): void {
  safeSet(USER_INFO_KEY, user)
  safeSet(TOKEN_KEY, token)
  // 首次登录时若 business_data 不存在则初始化（带演示任务，让用户立刻看到可操作的内容）
  const key = getUserStorageKey(BUSINESS_KEY, user.phone)
  const existing = safeGet<any | null>(key, null)
  if (!existing) {
    safeSet(key, getDefaultBusiness())
  }
}

/**
 * 退出登录：仅清除当前登录态（token+userInfo），业务数据保留
 * 用户重新登录同手机号后，旧数据依然可用
 */
export function onLogout(): void {
  safeRemove(TOKEN_KEY)
  safeRemove(USER_INFO_KEY)
}

// ========================================================================
//  用户身份隔离（最关键的一道保障）
// ========================================================================

/**
 * 为指定用户（或当前登录用户）生成专属存储键
 * 设计：baseKey_13812341234 —— 手机号是全系统稳定的身份标识
 */
export function getUserStorageKey(baseKey: string, phone?: string): string {
  const targetPhone = phone || getCurrentPhone()
  return targetPhone ? `${baseKey}_${targetPhone}` : baseKey
}

/**
 * 所有写操作前置校验：必须登录
 */
export function requireLogin(): User {
  const u = getCurrentUser()
  if (!u) {
    throw new Error('请先登录后再操作')
  }
  return u
}

/**
 * 所有权校验：该条数据是否属于当前登录用户
 * 使用场景：编辑/删除/确认等写操作
 */
export function isOwner(item: { user_id?: string; user_phone?: string; publisher_phone?: string; creator?: { id?: string } }): boolean {
  const u = getCurrentUser()
  if (!u) return false
  if (!item) return false
  if (item.user_id && (item.user_id === u.id || item.user_id === u.phone)) return true
  if ((item as any).user_phone && (item as any).user_phone === u.phone) return true
  if ((item as any).publisher_phone && (item as any).publisher_phone === u.phone) return true
  if ((item as any).creator?.id && ((item as any).creator.id === u.id || (item as any).creator.id === u.phone)) return true
  return false
}

// ========================================================================
//  统一业务数据容器（所有业务数据都在这里）
// ========================================================================
export interface BusinessData {
  posts: any[]
  activities: any[]
  tasks: any[]
  updated_at: number
  created_at?: number
}

const BUSINESS_KEY = 'linli_business_data'

function getDefaultBusiness(): BusinessData {
  const now = Date.now()
  return {
    posts: [],
    activities: [],
    tasks: [
      {
        id: 'demo-1',
        title: '帮忙取个快递',
        description: '菜鸟驿站，3 个包裹，取件码 1234。\n包裹大小适中，不太重。',
        category: 'delivery',
        location: '阳光社区·菜鸟驿站',
        reward: 5,
        status: 'pending',
        user_id: 'demo-publisher-1',
        user_phone: 'demo-publisher-1',
        creator: {
          id: 'demo-publisher-1',
          nickname: '阳光社区小李',
          avatar: '',
          credit_score: 95,
          community: '阳光社区'
        },
        created_at: now - 1000 * 60 * 10,
        updated_at: now - 1000 * 60 * 10
      },
      {
        id: 'demo-2',
        title: '帮忙带份早餐',
        description: '永和大王，豆浆油条套餐，加个煎蛋。',
        category: 'shopping',
        location: '永和大王·阳光社区店',
        reward: 8,
        status: 'pending',
        user_id: 'demo-publisher-2',
        user_phone: 'demo-publisher-2',
        creator: {
          id: 'demo-publisher-2',
          nickname: '上班族小王',
          avatar: '',
          credit_score: 92,
          community: '阳光社区'
        },
        created_at: now - 1000 * 60 * 20,
        updated_at: now - 1000 * 60 * 20
      },
      {
        id: 'demo-3',
        title: '代遛金毛半小时',
        description: '金毛很温顺，就在楼下花园，疫苗已打。',
        category: 'pet',
        location: '阳光社区·花园',
        reward: 15,
        status: 'in_progress',
        user_id: 'demo-publisher-3',
        user_phone: 'demo-publisher-3',
        creator: {
          id: 'demo-publisher-3',
          nickname: '铲屎官小刘',
          avatar: '',
          credit_score: 98,
          community: '阳光社区'
        },
        created_at: now - 1000 * 60 * 60,
        updated_at: now - 1000 * 60 * 60
      },
      {
        id: 'demo-4',
        title: '帮忙接孩子',
        description: '阳光小学门口，4 点 15 分，两个孩子。',
        category: 'child',
        location: '阳光小学·门口',
        reward: 25,
        status: 'pending',
        user_id: 'demo-publisher-4',
        user_phone: 'demo-publisher-4',
        creator: {
          id: 'demo-publisher-4',
          nickname: '双职工家庭',
          avatar: '',
          credit_score: 90,
          community: '阳光社区'
        },
        created_at: now - 1000 * 60 * 120,
        updated_at: now - 1000 * 60 * 120
      }
    ],
    created_at: now,
    updated_at: now
  }
}

/**
 * 加载当前登录用户名下的业务数据
 * 未登录时返回默认空数据 + 演示任务（首页展示用），但禁止写
 */
export function loadBusiness(): BusinessData {
  const key = getUserStorageKey(BUSINESS_KEY)
  const raw = safeGet<BusinessData | null>(key, null)
  if (raw) {
    // 合并：保留已保存的任务/帖子/活动，缺失的数组补空
    const hasAnyData =
      (Array.isArray(raw.tasks) && raw.tasks.length > 0) ||
      (Array.isArray(raw.posts) && raw.posts.length > 0) ||
      (Array.isArray(raw.activities) && raw.activities.length > 0)
    if (hasAnyData) {
      return {
        posts: Array.isArray(raw.posts) ? raw.posts : [],
        activities: Array.isArray(raw.activities) ? raw.activities : [],
        tasks: Array.isArray(raw.tasks) ? raw.tasks : [],
        created_at: raw.created_at || Date.now(),
        updated_at: raw.updated_at || Date.now()
      }
    }
    // 空数据（全为空数组）：首次登录初始化，用演示数据填充
    // 但如果是明确保存的空数据（比如用户删光了），则保持空
    if (raw.created_at && raw.updated_at) {
      return {
        posts: Array.isArray(raw.posts) ? raw.posts : [],
        activities: Array.isArray(raw.activities) ? raw.activities : [],
        tasks: Array.isArray(raw.tasks) ? raw.tasks : [],
        created_at: raw.created_at,
        updated_at: raw.updated_at
      }
    }
  }
  // 首次进入（无任何存储）：返回演示数据
  const demo = getDefaultBusiness()
  if (getCurrentUser()) {
    safeSet(key, demo)
  }
  return demo
}

export function saveBusiness(data: BusinessData): void {
  const key = getUserStorageKey(BUSINESS_KEY)
  data.updated_at = Date.now()
  safeSet(key, data)
}

export function updateBusiness(updater: (data: BusinessData) => BusinessData): BusinessData {
  const current = loadBusiness()
  const next = updater(current)
  saveBusiness(next)
  return next
}

// ========================================================================
//  健康打卡记录（同样按手机号隔离）
// ========================================================================
const HEALTH_KEY = 'linli_health_records'

export function loadHealthRecords(): any[] {
  const key = getUserStorageKey(HEALTH_KEY)
  return safeGet<any[]>(key, [])
}

export function saveHealthRecords(records: any[]): void {
  const key = getUserStorageKey(HEALTH_KEY)
  safeSet(key, records)
}

// ========================================================================
//  通用业务 key → value 存储（如用户设置、消息通知等）
// ========================================================================
export function loadGeneric<T>(key: string, defaultValue: T): T {
  const fullKey = getUserStorageKey(key)
  return safeGet<T>(fullKey, defaultValue) ?? defaultValue
}

export function saveGeneric<T>(key: string, value: T): void {
  const fullKey = getUserStorageKey(key)
  safeSet(fullKey, value)
}
