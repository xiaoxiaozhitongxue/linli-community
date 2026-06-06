import { createErrorResponse } from './response.js'
import { getTokenFromRequest, verifyToken } from './session.js'
import { getDb } from './db.js'

export async function requireAuth(context) {
  try {
    const { request } = context
    const token = getTokenFromRequest(request)

    if (!token) {
      return createErrorResponse(401, '未授权', '请先登录')
    }

    const payload = await verifyToken(token)
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
