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
    const { phone, password, nickname, community, avatar, gender } = body

    // 验证必填参数
    const missingFields = validateRequired(body, ['phone', 'password', 'nickname', 'community'])
    if (missingFields.length > 0) {
      return createErrorResponse(400, '缺少必要参数', { missing: missingFields })
    }

    // 验证手机号格式
    if (!validatePhone(phone)) {
      return createErrorResponse(400, '手机号格式不正确')
    }

    // 验证密码长度
    if (password.length < 6) {
      return createErrorResponse(400, '密码长度至少6位')
    }

    const db = getDb(context)

    // 检查手机号是否已注册
    const existingUser = await db.get('SELECT id FROM users WHERE phone = ?', [phone])
    if (existingUser) {
      return createErrorResponse(400, '该手机号已注册')
    }

    // 创建用户
    const userId = generateId()
    const hashedPassword = await hashPassword(password)
    const nowTimestamp = now()

    await db.insert('users', {
      id: userId,
      phone,
      password: hashedPassword,
      nickname,
      community,
      avatar: avatar || '',
      gender: gender || 'other',
      role: 'resident',
      credit_score: 100,
      is_verified: 0,
      created_at: nowTimestamp,
      updated_at: nowTimestamp,
      last_active_at: nowTimestamp
    })

    // 获取创建的用户信息
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId])

    // 生成 token
    const token = await createToken({ userId: user.id })

    const safeUser = {
      id: user.id,
      phone: user.phone,
      nickname: user.nickname,
      avatar: user.avatar,
      gender: user.gender,
      community: user.community,
      role: user.role,
      credit_score: user.credit_score,
      is_verified: user.is_verified === 1,
      created_at: user.created_at
    }

    return createResponse({
      token,
      user: safeUser
    }, '注册成功')
  } catch (error) {
    console.error('Register error:', error)
    return createErrorResponse(500, '注册失败', error.message)
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
