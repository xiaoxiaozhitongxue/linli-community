import {
  createResponse,
  createErrorResponse,
  getDb,
  now,
  validateRequired,
  validatePhone
} from '../../lib/index.js'
import { hashPassword } from '../../lib/auth.js'

export async function onRequestPost(context) {
  try {
    const { request } = context
    const body = await request.json()
    const { phone, newPassword } = body

    // 验证必填参数
    const missingFields = validateRequired(body, ['phone', 'newPassword'])
    if (missingFields.length > 0) {
      return createErrorResponse(400, '缺少必要参数', { missing: missingFields })
    }

    // 验证手机号格式
    if (!validatePhone(phone)) {
      return createErrorResponse(400, '手机号格式不正确')
    }

    // 验证新密码长度
    if (newPassword.length < 6) {
      return createErrorResponse(400, '新密码长度至少6位')
    }

    const db = getDb(context)

    // 根据手机号查找用户
    const user = await db.get('SELECT id, phone FROM users WHERE phone = ?', [phone])
    if (!user) {
      return createErrorResponse(404, '该手机号未注册')
    }

    // 对新密码加密
    const hashed = await hashPassword(newPassword)

    // 更新密码
    await db.update('users', {
      password: hashed,
      updated_at: now()
    }, 'id = ?', [user.id])

    return createResponse(null, '密码重置成功')
  } catch (error) {
    console.error('Reset password error:', error)
    return createErrorResponse(500, '密码重置失败', error.message)
  }
}

export function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}
