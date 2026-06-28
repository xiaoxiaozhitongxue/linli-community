import { createErrorResponse } from './response.js'
import { getTokenFromRequest, verifyToken } from './session.js'
import { getDb } from './db.js'

// 简单的密码哈希函数（生产环境建议使用更安全的方案）
export async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'linli-salt-2024')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// 验证密码
export async function verifyPassword(password, hashedPassword) {
  const hash = await hashPassword(password)
  return hash === hashedPassword
}

export async function requireAuth(context) {
  try {
    const { request } = context
    const token = getTokenFromRequest(request)

    if (!token) {
      return createErrorResponse(401, '未授权', '请先登录')
    }

    const payload = await verifyToken(token, context)
    if (!payload || !payload.userId) {
      return createErrorResponse(401, '未授权', '无效的登录凭证')
    }

    const db = getDb(context)
    const user = await db.get('SELECT * FROM users WHERE id = ?', [payload.userId])

    if (!user) {
      return createErrorResponse(401, '未授权', '用户不存在')
    }

    context.user = user
    return null
  } catch (error) {
    console.error('Auth middleware error:', error)
    return createErrorResponse(500, '认证失败', error.message)
  }
}
