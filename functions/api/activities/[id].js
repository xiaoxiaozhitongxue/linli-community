import {
  createResponse,
  createErrorResponse,
  getDb,
  requireAuth
} from '../../lib/index.js'

export async function onRequestGet(context) {
  try {
    const { id } = context.params
    const db = getDb(context)

    const activity = await db.get(`
      SELECT a.*, u.nickname, u.avatar
      FROM activities a
      JOIN users u ON a.user_id = u.id
      WHERE a.id = ?
    `, [id])

    if (!activity) {
      return createErrorResponse(404, '活动不存在')
    }

    return createResponse({
      ...activity,
      images: activity.images ? JSON.parse(activity.images) : [],
      user: {
        id: activity.user_id,
        nickname: activity.nickname,
        avatar: activity.avatar
      }
    }, '获取活动成功')
  } catch (error) {
    console.error('Get activity error:', error)
    return createErrorResponse(500, '获取活动失败', error.message)
  }
}

export function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}
