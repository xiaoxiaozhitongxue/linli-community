// 统一数据存储层
//
// 设计原则：
// 1. 所有业务数据（tasks/posts/activities/...）统一通过本文件读写
// 2. 已登录用户的数据自动按手机号隔离：baseKey_phone
// 3. 未登录时使用全局键（降级，仅用于引导页）
// 4. 写入立即落盘：任何变更后立即写入localStorage，下次启动自动恢复

import type { User } from './api'

// --- 工具：安全读取/写入
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

// --- 当前用户信息：login/logout 与 store/index.ts 同步
const USER_INFO_KEY = 'userInfo'
const TOKEN_KEY = 'token'

export function loadUserInfo(): User | null {
  const raw = localStorage.getItem(USER_INFO_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function saveAuthInfo(user: User, token: string): void {
  safeSet(USER_INFO_KEY, user)
  safeSet(TOKEN_KEY, token)
}

export function clearAuthInfo(): void {
  safeRemove(USER_INFO_KEY)
  safeRemove(TOKEN_KEY)
}

export function getCurrentUser(): User | null {
  return loadUserInfo()
}

function getCurrentPhone(): string | null {
  const u = loadUserInfo()
  return u?.phone ?? null
}

// --- 核心：按手机号生成用户专属存储键
export function getUserStorageKey(baseKey: string): string {
  const phone = getCurrentPhone()
  return phone ? `${baseKey}_${phone}` : baseKey
}

// --- 统一业务数据容器
// tasks: 互助任务列表（包含所有可在任务广场展示）
//   myCreatedTasks: 我发布的任务
//   myAcceptedTasks: 我接的任务
export interface BusinessData {
  tasks: any[]
  activities: any[]
  posts: any[]
}

const BUSINESS_KEY = 'linli_business_data'

function getDefaultBusiness(): BusinessData {
  return {
    tasks: [
      {
        id: 'demo-1',
        title: '帮忙取个快递',
        description: '菜鸟驿站，3 个包裹，取件码 1234。\n包裹大小适中，不太重。',
        category: 'delivery',
        location: '阳光社区·菜鸟驿站',
        reward: 5,
        status: TASK_STATUS_PENDING,
        publisher_phone: '13800000001',
        publisher_name: '小红',
        helper_phone: '',
        helper_name: '',
        created_at: Date.now() - 1000 * 60 * 10,
        updated_at: Date.now() - 1000 * 60 * 10
      },
      {
        id: 'demo-2',
        title: '帮忙带份早餐',
        description: '永和大王，豆浆油条套餐，加个煎蛋。',
        category: 'shopping',
        location: '永和大王·阳光社区店',
        reward: 8,
        status: TASK_STATUS_PENDING,
        publisher_phone: '13800000002',
        publisher_name: '上班族小王',
        helper_phone: '',
        helper_name: '',
        created_at: Date.now() - 1000 * 60 * 20,
        updated_at: Date.now() - 1000 * 60 * 20
      },
      {
        id: 'demo-3',
        title: '代遛金毛半小时',
        description: '金毛很温顺，就在楼下花园，疫苗已打。',
        category: 'pet',
        location: '阳光社区·花园',
        reward: 15,
        status: TASK_STATUS_IN_PROGRESS,
        publisher_phone: '13800000003',
        publisher_name: '铲屎官小刘',
        helper_phone: '',
        helper_name: '',
        created_at: Date.now() - 1000 * 60 * 60,
        updated_at: Date.now() - 1000 * 60 * 60
      },
      {
        id: 'demo-4',
        title: '帮忙接孩子',
        description: '阳光小学门口，4 点 15 分，两个孩子。',
        category: 'child',
        location: '阳光小学·门口',
        reward: 25,
        status: TASK_STATUS_PENDING,
        publisher_phone: '13800000004',
        publisher_name: '双职工家庭',
        helper_phone: '',
        helper_name: '',
        created_at: Date.now() - 1000 * 60 * 120,
        updated_at: Date.now() - 1000 * 60 * 120
      }
    ],
    posts: [],
    activities: [],
    created_at: Date.now(),
    updated_at: Date.now()
  }
}

export function loadBusiness(): BusinessData {
  const key = getUserStorageKey(BUSINESS_KEY)
  return safeGet<BusinessData>(key, getDefaultBusiness()) ?? getDefaultBusiness()
}

export function saveBusiness(data: BusinessData): void {
  const key = getUserStorageKey(BUSINESS_KEY)
  safeSet(key, data)
}

export function updateBusiness(updater: (data: BusinessData) => BusinessData): BusinessData {
  const current = loadBusiness()
  const next = updater(current)
  saveBusiness(next)
  return next
}

// --- 健康打卡记录
const HEALTH_KEY = 'linli_health_records'

export function loadHealthRecords(): any[] {
  const key = getUserStorageKey(HEALTH_KEY)
  return safeGet<any[]>(key, [])
}

export function saveHealthRecords(records: any[]): void {
  const key = getUserStorageKey(HEALTH_KEY)
  safeSet(key, records)
}

// --- 通用业务 key → value 存储（如用户设置、消息通知等）
export function loadGeneric<T>(key: string, defaultValue: T): T {
  const fullKey = getUserStorageKey(key)
  return safeGet<T>(fullKey, defaultValue) ?? defaultValue
}

export function saveGeneric<T>(key: string, value: T): void {
  const fullKey = getUserStorageKey(key)
  safeSet(fullKey, value)
}
