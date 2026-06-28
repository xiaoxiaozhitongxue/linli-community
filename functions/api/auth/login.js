import {
  createResponse,
  createErrorResponse,
  getDb,
  generateId,
  now,
  validateRequired,
  validatePhone,
  createToken
} from '../../lib/index.js'
import { hashPassword, verifyPassword } from '../../lib/auth.js'

export async function onRequestPost(context) {
  try {
    const { request } = context
    const body = await request.json()
    const { phone, password } = body

    // 验证必填参数
    const missingFields = validateRequired(body, ['phone', 'password'])
    if (missingFields.length > 0) {
      return createErrorResponse(400, '缺少必要参数', { missing: missingFields })
    }

    // 验证手机号格式
    if (!validatePhone(phone)) {
      return createErrorResponse(400, '手机号格式不正确')
    }

    const db = getDb(context)

    // 查找用户
    const user = await db.get('SELECT * FROM users WHERE phone = ?', [phone])

    if (!user) {
      return createErrorResponse(401, '手机号或密码错误')
    }

    // 验证密码
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return createErrorResponse(401, '手机号或密码错误')
    }

    // 更新最后活跃时间
    await db.update('users', {
      last_active_at: now()
    }, 'id = ?', [user.id])

    // 生成 token
    const token = await createToken({ userId: user.id }, context)

    const safeUser = {
      id: user.id,
      phone: user.phone,
      nickname: user.nickname,
      avatar: user.avatar,
      gender: user.gender,
      birthday: user.birthday,
      community: user.community,
      address: user.address,
      bio: user.bio,
      role: user.role,
      credit_score: user.credit_score,
      is_verified: user.is_verified === 1,
      created_at: user.created_at,
      last_active_at: user.last_active_at
    }

    return createResponse({
      token,
      user: safeUser
    }, '登录成功')
  } catch (error) {
    console.error('Login error:', error)
    return createErrorResponse(500, '登录失败', error.message)
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
