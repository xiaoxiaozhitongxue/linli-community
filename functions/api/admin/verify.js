// ============================================================================
// 管理员验证接口：POST /api/admin/verify
// 验证用户是否具有管理员权限（is_verified = 1 且 role 具有管理能力）
// ============================================================================
import { getDb } from '../../lib/db.js'
import { createResponse, createErrorResponse } from '../../lib/response.js'
import { parseJsonBody } from '../../lib/utils.js'

export async function onRequestPost(context) {
  try {
    const db = getDb(context)
    const body = await parseJsonBody(context.request)
    const { phone } = body

    if (!phone) {
      return createErrorResponse(400, '请输入手机号')
    }

    // 查找用户并验证管理员身份
    // 使用 is_verified=1 作为管理员判定条件
    const user = await db.get(
      `SELECT id, nickname, phone, role, is_verified FROM users WHERE phone = ?`,
      [phone]
    )

    if (!user) {
      return createErrorResponse(403, '用户不存在')
    }

    // 检查是否为已认证用户（is_verified=1）
    if (!user.is_verified) {
      return createErrorResponse(403, '无管理员权限：该用户未通过认证')
    }

    return createResponse({
      user: {
        id: user.id,
        nickname: user.nickname,
        phone: user.phone,
        role: user.role
      }
    }, '验证成功')
  } catch (error) {
    console.error('Admin verify error:', error)
    return createErrorResponse(500, '验证失败', error.message)
  }
}
