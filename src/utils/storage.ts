// ==========================================================================
//  登录态存储（Auth Storage）
// ==========================================================================
//
//  本模块只负责前端登录态（userInfo + token）的持久化。
//  所有业务数据（帖子、活动、互助任务、健康打卡等）均存储在云端，
//  通过 api.ts 的 Cloudflare Pages Functions API 进行增删改查。
//
//  存储结构
//  --------
//    userInfo  → 当前登录用户信息（全局唯一，"正在用哪个账号"）
//    token     → 当前登录 token（登录凭证，用于 API 鉴权）
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

export function isLoggedIn(): boolean {
  return !!getCurrentUser()
}

/**
 * 登录成功后：写入 userInfo + token
 * 业务数据由云端统一存储，不再需要前端本地初始化。
 */
export function onLoginSuccess(user: User, token: string): void {
  safeSet(USER_INFO_KEY, user)
  safeSet(TOKEN_KEY, token)
}

/**
 * 退出登录：清除当前登录态（token + userInfo）
 */
export function onLogout(): void {
  safeRemove(TOKEN_KEY)
  safeRemove(USER_INFO_KEY)
}
