import {
  createResponse,
  createErrorResponse,
  getDb,
  requireAuth
} from '../../lib/index.js'

export async function onRequestGet(context) {
  try {
    const authError = await requireAuth(context)
    if (authError) {
      return authError
    }

    const user = context.user
    const db = getDb(context)
    
    const url = new URL(context.request.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const limit = parseInt(url.searchParams.get('limit')) || 10
    const offset = (page - 1) * limit

    const activities = await db.all(`
      SELECT 
        a.*,
        u.nickname as author_nickname,
        u.avatar as author_avatar,
        ap.id as participant_id
      FROM activities a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN activity_participants ap ON a.id = ap.activity_id AND ap.user_id = ?
      WHERE a.user_id = ? OR ap.user_id = ?
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `, [user.id, user.id, user.id, limit, offset])

    const totalCount = await db.get(`
      SELECT COUNT(DISTINCT a.id) as count 
      FROM activities a
      LEFT JOIN activity_participants ap ON a.id = ap.activity_id
      WHERE a.user_id = ? OR ap.user_id = ?
    `, [user.id, user.id])

    const formattedActivities = activities.map(activity => ({
      ...activity,
      images: activity.images ? JSON.parse(activity.images) : [],
      user: {
        id: activity.user_id,
        nickname: activity.author_nickname,
        avatar: activity.author_avatar
      },
      is_participant: !!activity.participant_id
    }))

    return createResponse({
      items: formattedActivities,
      page,
      limit,
      total: totalCount.count,
      total_pages: Math.ceil(totalCount.count / limit)
    }, '获取活动成功')
  } catch (error) {
    console.error('Get user activities error:', error)
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
