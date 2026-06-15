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

// ========================================================================
// 账号1: 13811112222 (热心邻居张阿姨) 的示例数据
// ========================================================================
function getAccount1Business(): BusinessData {
  const now = Date.now()
  return {
    posts: [
      {
        id: 'post-account1-1',
        content: '今天天气真好，大家有空可以出来活动活动！顺便分享一下我今天做的点心🍪',
        images: [],
        location: '阳光社区',
        visibility: 'public',
        user_id: '13811112222',
        user: {
          id: '13811112222',
          nickname: '热心邻居张阿姨',
          avatar: 'https://i.pravatar.cc/100?img=1'
        },
        like_count: 12,
        comment_count: 5,
        is_liked: false,
        created_at: now - 1000 * 60 * 30,
        updated_at: now - 1000 * 60 * 30
      },
      {
        id: 'post-account1-2',
        content: '阳光社区的老年活动中心下周要举办健康讲座，有兴趣的邻居可以报名参加。',
        images: [],
        location: '阳光社区活动中心',
        visibility: 'public',
        user_id: '13811112222',
        user: {
          id: '13811112222',
          nickname: '热心邻居张阿姨',
          avatar: 'https://i.pravatar.cc/100?img=1'
        },
        like_count: 8,
        comment_count: 3,
        is_liked: false,
        created_at: now - 1000 * 60 * 120,
        updated_at: now - 1000 * 60 * 120
      }
    ],
    activities: [
      {
        id: 'activity-account1-1',
        title: '周末乒乓球友谊赛',
        description: '社区乒乓球爱好者交流活动，新手友好！欢迎大家积极参与。',
        category: 'sports',
        location: '阳光社区活动中心',
        start_time: (now + 86400000 * 3) / 1000,
        end_time: (now + 86400000 * 3 + 7200000) / 1000,
        max_participants: 20,
        current_participants: 8,
        images: [],
        status: 'upcoming',
        user_id: '13811112222',
        user: {
          id: '13811112222',
          nickname: '热心邻居张阿姨',
          avatar: 'https://i.pravatar.cc/100?img=1'
        },
        is_participant: false,
        created_at: now - 86400000,
        updated_at: now - 86400000
      }
    ],
    tasks: [
      {
        id: 'demo-account1-1',
        title: '帮忙取个快递',
        description: '菜鸟驿站，3 个包裹，取件码 1234。\n包裹大小适中，不太重。',
        category: 'delivery',
        location: '阳光社区·菜鸟驿站',
        reward: 5,
        status: 'pending',
        user_id: '13811112222',
        user_phone: '13811112222',
        creator: {
          id: '13811112222',
          nickname: '热心邻居张阿姨',
          avatar: 'https://i.pravatar.cc/100?img=1',
          credit_score: 98,
          community: '阳光社区'
        },
        created_at: now - 1000 * 60 * 10,
        updated_at: now - 1000 * 60 * 10
      },
      {
        id: 'demo-account1-2',
        title: '帮忙浇花',
        description: '出差三天，家里阳台的花需要浇水。有时间的邻居帮忙看一下。',
        category: 'help',
        location: '阳光社区·3号楼',
        reward: 3,
        status: 'pending',
        user_id: '13811112222',
        user_phone: '13811112222',
        creator: {
          id: '13811112222',
          nickname: '热心邻居张阿姨',
          avatar: 'https://i.pravatar.cc/100?img=1',
          credit_score: 98,
          community: '阳光社区'
        },
        created_at: now - 1000 * 60 * 60,
        updated_at: now - 1000 * 60 * 60
      }
    ],
    created_at: now,
    updated_at: now
  }
}

// ========================================================================
// 账号2: 13811113333 (社区达人李先生) 的示例数据
// ========================================================================
function getAccount2Business(): BusinessData {
  const now = Date.now()
  return {
    posts: [
      {
        id: 'post-account2-1',
        content: '推荐社区旁边新开的咖啡店，味道很不错！环境也很舒适，适合周末来坐坐。☕',
        images: ['https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400'],
        location: '阳光社区',
        visibility: 'public',
        user_id: '13811113333',
        user: {
          id: '13811113333',
          nickname: '社区达人李先生',
          avatar: 'https://i.pravatar.cc/100?img=2'
        },
        like_count: 15,
        comment_count: 6,
        is_liked: false,
        created_at: now - 1000 * 60 * 45,
        updated_at: now - 1000 * 60 * 45
      },
      {
        id: 'post-account2-2',
        content: '二手闲置物品转让：九成新的儿童自行车，有需要的邻居可以联系我。',
        images: [],
        location: '阳光社区',
        visibility: 'public',
        user_id: '13811113333',
        user: {
          id: '13811113333',
          nickname: '社区达人李先生',
          avatar: 'https://i.pravatar.cc/100?img=2'
        },
        like_count: 5,
        comment_count: 2,
        is_liked: false,
        created_at: now - 1000 * 60 * 180,
        updated_at: now - 1000 * 60 * 180
      }
    ],
    activities: [
      {
        id: 'activity-account2-1',
        title: '社区读书会',
        description: '本周读书分享会，欢迎爱读书的邻居们参加！',
        category: 'culture',
        location: '阳光社区图书馆',
        start_time: (now + 86400000 * 5) / 1000,
        end_time: (now + 86400000 * 5 + 5400000) / 1000,
        max_participants: 15,
        current_participants: 6,
        images: [],
        status: 'upcoming',
        user_id: '13811113333',
        user: {
          id: '13811113333',
          nickname: '社区达人李先生',
          avatar: 'https://i.pravatar.cc/100?img=2'
        },
        is_participant: false,
        created_at: now - 86400000 * 2,
        updated_at: now - 86400000 * 2
      }
    ],
    tasks: [
      {
        id: 'demo-account2-1',
        title: '帮忙带份早餐',
        description: '永和大王，豆浆油条套餐，加个煎蛋。',
        category: 'shopping',
        location: '永和大王·阳光社区店',
        reward: 8,
        status: 'pending',
        user_id: '13811113333',
        user_phone: '13811113333',
        creator: {
          id: '13811113333',
          nickname: '社区达人李先生',
          avatar: 'https://i.pravatar.cc/100?img=2',
          credit_score: 92,
          community: '阳光社区'
        },
        created_at: now - 1000 * 60 * 20,
        updated_at: now - 1000 * 60 * 20
      },
      {
        id: 'demo-account2-2',
        title: '代遛金毛半小时',
        description: '金毛很温顺，就在楼下花园，疫苗已打。',
        category: 'pet',
        location: '阳光社区·花园',
        reward: 15,
        status: 'pending',
        user_id: '13811113333',
        user_phone: '13811113333',
        creator: {
          id: '13811113333',
          nickname: '社区达人李先生',
          avatar: 'https://i.pravatar.cc/100?img=2',
          credit_score: 92,
          community: '阳光社区'
        },
        created_at: now - 1000 * 60 * 90,
        updated_at: now - 1000 * 60 * 90
      },
      {
        id: 'demo-account2-3',
        title: '帮忙接孩子',
        description: '阳光小学门口，4 点 15 分，两个孩子。',
        category: 'child',
        location: '阳光小学·门口',
        reward: 25,
        status: 'pending',
        user_id: '13811113333',
        user_phone: '13811113333',
        creator: {
          id: '13811113333',
          nickname: '社区达人李先生',
          avatar: 'https://i.pravatar.cc/100?img=2',
          credit_score: 92,
          community: '阳光社区'
        },
        created_at: now - 1000 * 60 * 150,
        updated_at: now - 1000 * 60 * 150
      }
    ],
    created_at: now,
    updated_at: now
  }
}

function getDefaultBusiness(phone?: string): BusinessData {
  if (phone === '13811112222') return getAccount1Business()
  if (phone === '13811113333') return getAccount2Business()
  return {
    posts: [],
    activities: [],
    tasks: [],
    created_at: Date.now(),
    updated_at: Date.now()
  }
}

/**
 * 加载当前登录用户名下的业务数据
 * 未登录时返回空数据，登录时根据手机号初始化对应的示例数据
 */
export function loadBusiness(): BusinessData {
  const user = getCurrentUser()
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
    // 空数据（全为空数组）：首次登录初始化
    // 根据手机号返回对应的示例数据
    if (raw.created_at && raw.updated_at && user) {
      const demo = getDefaultBusiness(user.phone)
      safeSet(key, demo)
      return demo
    }
  }
  // 首次进入（无任何存储）：根据用户手机号返回对应的示例数据
  if (user) {
    const demo = getDefaultBusiness(user.phone)
    safeSet(key, demo)
    return demo
  }
  return {
    posts: [],
    activities: [],
    tasks: [],
    created_at: Date.now(),
    updated_at: Date.now()
  }
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
