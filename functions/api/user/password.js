import {
  createResponse,
  createErrorResponse,
  getDb,
  now,
  requireAuth,
  hashPassword,
  verifyPassword
} from '../../lib/index.js'

export async function onRequestPut(context) {
  try {
    const authError = await requireAuth(context)
    if (authError) {
      return authError
    }

    const user = context.user
    const { request } = context
    const body = await request.json()
    const { currentPassword, newPassword } = body

    // 验证必填参数
    if (!currentPassword || !newPassword) {
      return createErrorResponse(400, '请提供当前密码和新密码')
    }

    // 验证新密码长度
    if (newPassword.length < 6) {
      return createErrorResponse(400, '新密码长度至少6位')
    }

    // 验证当前密码是否正确
    const isValid = await verifyPassword(currentPassword, user.password)
    if (!isValid) {
      return createErrorResponse(400, '当前密码不正确')
    }

    // 对新密码加密
    const hashed = await hashPassword(newPassword)

    // 更新密码
    const db = getDb(context)
    await db.update('users', {
      password: hashed,
      updated_at: now()
    }, 'id = ?', [user.id])

    return createResponse(null, '密码修改成功')
  } catch (error) {
    console.error('Change password error:', error)
    return createErrorResponse(500, '密码修改失败', error.message)
  }
}

export function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}
