import {
  createResponse,
  createErrorResponse,
  getDb,
  requireAuth,
  now
} from '../../lib/index.js'

export async function onRequestGet(context) {
  try {
    const db = getDb(context)
    
    const url = new URL(context.request.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const limit = parseInt(url.searchParams.get('limit')) || 10
    const offset = (page - 1) * limit

    const activities = await db.all(`
      SELECT 
        a.*,
        u.nickname as author_nickname,
        u.avatar as author_avatar
      FROM activities a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset])

    const totalCount = await db.get(`
      SELECT COUNT(*) as count FROM activities
    `)

    const formattedActivities = activities.map(activity => ({
      ...activity,
      images: activity.images ? JSON.parse(activity.images) : [],
      user: {
        id: activity.user_id,
        nickname: activity.author_nickname,
        avatar: activity.author_avatar
      }
    }))

    return createResponse({
      items: formattedActivities,
      page,
      limit,
      total: totalCount.count,
      total_pages: Math.ceil(totalCount.count / limit)
    }, '获取活动成功')
  } catch (error) {
    console.error('Get activities error:', error)
    return createErrorResponse(500, '获取活动失败', error.message)
  }
}

export async function onRequestPost(context) {
  try {
    const authError = await requireAuth(context)
    if (authError) {
      return authError
    }

    const user = context.user
    const db = getDb(context)
    const body = await context.request.json()
    const {
      title,
      description,
      category = 'other',
      location,
      start_time,
      end_time,
      max_participants,
      images = []
    } = body

    if (!title || !description || !location || !start_time) {
      return createErrorResponse(400, '缺少必要参数')
    }

    const id = crypto.randomUUID()
    const startTimeTimestamp = new Date(start_time).getTime() / 1000
    const endTimeTimestamp = end_time ? new Date(end_time).getTime() / 1000 : null

    await db.run(`
      INSERT INTO activities (
        id, user_id, title, description, category, location,
        start_time, end_time, max_participants, current_participants,
        images, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'upcoming', ?, ?)
    `, [
      id, user.id, title, description, category, location,
      startTimeTimestamp, endTimeTimestamp, max_participants,
      JSON.stringify(images), now(), now()
    ])

    const createdActivity = await db.get(`
      SELECT a.*, u.nickname, u.avatar
      FROM activities a
      JOIN users u ON a.user_id = u.id
      WHERE a.id = ?
    `, [id])

    return createResponse({
      ...createdActivity,
      images: createdActivity.images ? JSON.parse(createdActivity.images) : [],
      user: {
        id: createdActivity.user_id,
        nickname: createdActivity.nickname,
        avatar: createdActivity.avatar
      }
    }, '创建活动成功')
  } catch (error) {
    console.error('Create activity error:', error)
    return createErrorResponse(500, '创建活动失败', error.message)
  }
}

export function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}
