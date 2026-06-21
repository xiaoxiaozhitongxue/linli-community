import {
  createResponse,
  createErrorResponse,
  createPaginatedResponse,
  getDb,
  requireAuth,
  now,
  generateId
} from '../../lib/index.js'

async function getActivitiesWithUserInfo(db, activities, userId) {
  if (activities.length === 0) {
    return []
  }

  const userIds = [...new Set(activities.map(a => a.user_id))]
  let users = []
  if (userIds.length > 0) {
    users = await db.query(
      `SELECT id, nickname, avatar, community FROM users WHERE id IN (${userIds.map(() => '?').join(', ')})`,
      userIds
    )
  }
  const userMap = {}
  for (const user of users) {
    userMap[user.id] = user
  }

  let participantMap = {}
  if (userId && activities.length > 0) {
    const activityIds = activities.map(a => a.id)
    const placeholders = activityIds.map(() => '?').join(',')
    const participants = await db.query(
      `SELECT activity_id FROM activity_participants WHERE user_id = ? AND activity_id IN (${placeholders})`,
      [userId, ...activityIds]
    )
    for (const p of participants) {
      participantMap[p.activity_id] = true
    }
  }

  return activities.map(activity => ({
    ...activity,
    user: userMap[activity.user_id] || null,
    is_participant: !!participantMap[activity.id],
    images: activity.images ? JSON.parse(activity.images) : []
  }))
}

export async function onRequestGet(context) {
  try {
    const db = getDb(context)
    
    const url = new URL(context.request.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 10, 50)
    const offset = (page - 1) * limit
    const status = url.searchParams.get('status')
    const category = url.searchParams.get('category')
    const sort = url.searchParams.get('sort') || 'created_at'
    const order = url.searchParams.get('order') === 'asc' ? 'ASC' : 'DESC'

    // 验证排序字段
    const allowedSortFields = ['created_at', 'start_time', 'current_participants']
    const sortField = allowedSortFields.includes(sort) ? sort : 'created_at'

    let whereClauses = []
    let params = []

    if (status) {
      whereClauses.push('a.status = ?')
      params.push(status)
    }

    if (category) {
      whereClauses.push('a.category = ?')
      params.push(category)
    }

    const whereClause = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : ''

    const activities = await db.query(`
      SELECT a.*, u.nickname, u.avatar, u.community
      FROM activities a
      JOIN users u ON a.user_id = u.id
      ${whereClause}
      ORDER BY a.${sortField} ${order}
      LIMIT ? OFFSET ?
    `, [...params, limit, offset])

    const countQuery = whereClause 
      ? `SELECT COUNT(*) as count FROM activities a ${whereClause}`
      : `SELECT COUNT(*) as count FROM activities`
    
    const totalResult = await db.get(countQuery, params)
    const total = totalResult.count

    let userId = null
    try {
      const authError = await requireAuth(context)
      if (!authError) {
        userId = context.user.id
      }
    } catch (e) {
    }

    const formattedActivities = await getActivitiesWithUserInfo(db, activities, userId)

    return createPaginatedResponse(formattedActivities, page, limit, total, '获取活动成功')
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

    const validCategories = ['sports', 'culture', 'charity', 'party', 'other']
    if (!validCategories.includes(category)) {
      return createErrorResponse(400, '无效的活动类型')
    }

    const id = generateId()
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

    // 获取创建的活动
    const createdActivity = await db.get(`
      SELECT a.*, u.nickname, u.avatar, u.community
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
        avatar: createdActivity.avatar,
        community: createdActivity.community
      },
      is_participant: false
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
