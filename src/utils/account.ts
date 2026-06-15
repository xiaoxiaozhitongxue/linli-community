// ========================================================================
// 账号管理工具 - 处理账号注册、验证、登录
// ========================================================================

// 账号存储键
const ACCOUNTS_KEY = 'linli_accounts'

// 简单加密函数
function encryptPassword(password: string): string {
  return btoa(password + '_linli_salt')
}

/**
 * 获取所有已注册账号
 */
export function getAllAccounts(): Record<string, { password: string; nickname: string }> {
  const raw = localStorage.getItem(ACCOUNTS_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

/**
 * 检查账号是否存在
 */
export function accountExists(username: string): boolean {
  const accounts = getAllAccounts()
  return !!accounts[username]
}

/**
 * 验证密码
 */
export function verifyPassword(username: string, password: string): boolean {
  const accounts = getAllAccounts()
  const account = accounts[username]
  if (!account) return false
  return account.password === encryptPassword(password)
}

/**
 * 注册账号
 */
export function registerAccount(username: string, password: string, nickname: string): boolean {
  if (!username || !password || !nickname) return false
  if (accountExists(username)) return false
  
  const accounts = getAllAccounts()
  accounts[username] = {
    password: encryptPassword(password),
    nickname
  }
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  return true
}

/**
 * 获取账号信息
 */
export function getAccount(username: string): { password: string; nickname: string } | null {
  const accounts = getAllAccounts()
  return accounts[username] || null
}