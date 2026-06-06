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

const VERIFICATION_CODE = '123456'

export async function onRequestPost(context) {
  try {
    const { request } = context
    const body = await request.json()
    const { phone, code, nickname, community } = body

    const missingFields = validateRequired(body, ['phone', 'code'])
    if (missingFields.length > 0) {
      return createErrorResponse(400, '缺少必要参数', { missing: missingFields })
    }

    if (!validatePhone(phone)) {
      return createErrorResponse(400, '手机号格式不正确')
    }

    if (code !== VERIFICATION_CODE) {
      return createErrorResponse(400, '验证码错误')
    }

    const db = getDb(context)

    let user = await db.get('SELECT * FROM users WHERE phone = ?', [phone])

    if (!user) {
      if (!nickname || !community) {
        return createErrorResponse(400, '首次登录需要填写昵称和社区')
      }

      const userId = generateId()
      const nowTimestamp = now()

      await db.insert('users', {
        id: userId,
        phone,
        nickname,
        community,
        role: 'resident',
        credit_score: 100,
        is_verified: 0,
        created_at: nowTimestamp,
        updated_at: nowTimestamp,
        last_active_at: nowTimestamp
      })

      user = await db.get('SELECT * FROM users WHERE id = ?', [userId])
    } else {
      await db.update('users', {
        last_active_at: now()
      }, 'id = ?', [user.id])
    }

    const token = await createToken({ userId: user.id })

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
