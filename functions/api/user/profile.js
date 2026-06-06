import {
  createResponse,
  createErrorResponse,
  getDb,
  now,
  requireAuth
} from '../../lib/index.js'

export async function onRequestGet(context) {
  try {
    const authError = await requireAuth(context)
    if (authError) {
      return authError
    }

    const user = context.user

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

    return createResponse(safeUser, '获取用户资料成功')
  } catch (error) {
    console.error('Get profile error:', error)
    return createErrorResponse(500, '获取用户资料失败', error.message)
  }
}

export async function onRequestPut(context) {
  try {
    const authError = await requireAuth(context)
    if (authError) {
      return authError
    }

    const user = context.user
    const { request } = context
    const body = await request.json()

    const allowedFields = [
      'nickname', 'avatar', 'gender', 'birthday',
      'community', 'address', 'bio'
    ]

    const updateData = {
      updated_at: now()
    }

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (updateData.gender && !['male', 'female', 'other'].includes(updateData.gender)) {
      return createErrorResponse(400, '性别值无效')
    }

    const db = getDb(context)
    await db.update('users', updateData, 'id = ?', [user.id])

    const updatedUser = await db.get('SELECT * FROM users WHERE id = ?', [user.id])

    const safeUser = {
      id: updatedUser.id,
      phone: updatedUser.phone,
      nickname: updatedUser.nickname,
      avatar: updatedUser.avatar,
      gender: updatedUser.gender,
      birthday: updatedUser.birthday,
      community: updatedUser.community,
      address: updatedUser.address,
      bio: updatedUser.bio,
      role: updatedUser.role,
      credit_score: updatedUser.credit_score,
      is_verified: updatedUser.is_verified === 1,
      created_at: updatedUser.created_at,
      last_active_at: updatedUser.last_active_at
    }

    return createResponse(safeUser, '更新用户资料成功')
  } catch (error) {
    console.error('Update profile error:', error)
    return createErrorResponse(500, '更新用户资料失败', error.message)
  }
}

export function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}
