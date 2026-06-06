import {
  createResponse,
  createErrorResponse,
  createPaginatedResponse,
  getDb,
  requireAuth,
  now,
  generateId,
  validateRequired
} from '../../lib/index.js'

export async function onRequestGet(context) {
  try {
    const db = getDb(context)
    
    const url = new URL(context.request.url)
    const page = parseInt(url.searchParams.get('page')) || 1
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 10, 50)
    const offset = (page - 1) * limit
    const status = url.searchParams.get('status')
    const category = url.searchParams.get('category')
    const user_id = url.searchParams.get('user_id')
    const helper_id = url.searchParams.get('helper_id')
    const sort = url.searchParams.get('sort') || 'created_at'
    const order = url.searchParams.get('order') === 'asc' ? 'ASC' : 'DESC'

    // 验证排序字段
    const allowedSortFields = ['created_at', 'deadline', 'status', 'category']
    const sortField = allowedSortFields.includes(sort) ? sort : 'created_at'

    let whereClauses = []
    let params = []

    if (status) {
      whereClauses.push('t.status = ?')
      params.push(status)
    }

    if (category) {
      whereClauses.push('t.category = ?')
      params.push(category)
    }

    if (user_id) {
      whereClauses.push('t.user_id = ?')
      params.push(user_id)
    }

    if (helper_id) {
      whereClauses.push('t.helper_id = ?')
      params.push(helper_id)
    }

    const whereClause = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : ''

    const tasks = await db.query(`
      SELECT 
        t.*,
        u.nickname as creator_nickname,
        u.avatar as creator_avatar,
        u.credit_score as creator_credit_score,
        u.is_verified as creator_is_verified,
        u.community as creator_community,
        h.nickname as helper_nickname,
        h.avatar as helper_avatar
      FROM tasks t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN users h ON t.helper_id = h.id
      ${whereClause}
      ORDER BY t.${sortField} ${order}
      LIMIT ? OFFSET ?
    `, [...params, limit, offset])

    const countQuery = whereClause 
      ? `SELECT COUNT(*) as count FROM tasks t ${whereClause}`
      : `SELECT COUNT(*) as count FROM tasks`
    
    const totalResult = await db.get(countQuery, params)
    const total = totalResult.count

    const formattedTasks = tasks.map(task => ({
      ...task,
      creator: {
        id: task.user_id,
        nickname: task.creator_nickname,
        avatar: task.creator_avatar,
        credit_score: task.creator_credit_score,
        is_verified: task.creator_is_verified,
        community: task.creator_community
      },
      helper: task.helper_id ? {
        id: task.helper_id,
        nickname: task.helper_nickname,
        avatar: task.helper_avatar
      } : null
    }))

    return createPaginatedResponse(formattedTasks, page, limit, total, '获取任务列表成功')
  } catch (error) {
    console.error('Get tasks error:', error)
    return createErrorResponse(500, '获取任务列表失败', error.message)
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
      reward,
      deadline
    } = body

    const missing = validateRequired(body, ['title', 'description', 'location'])
    if (missing.length > 0) {
      return createErrorResponse(400, '缺少必要参数', { missing })
    }

    const validCategories = ['shopping', 'delivery', 'help', 'companionship', 'other']
    if (!validCategories.includes(category)) {
      return createErrorResponse(400, '无效的任务类型')
    }

    const id = generateId()
    const deadlineTimestamp = deadline ? new Date(deadline).getTime() / 1000 : null

    await db.run(`
      INSERT INTO tasks (
        id, user_id, title, description, category, location,
        reward, deadline, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    `, [
      id, user.id, title, description, category, location,
      reward, deadlineTimestamp, now(), now()
    ])

    const createdTask = await db.get(`
      SELECT 
        t.*,
        u.nickname as creator_nickname,
        u.avatar as creator_avatar,
        u.credit_score as creator_credit_score,
        u.is_verified as creator_is_verified
      FROM tasks t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `, [id])

    return createResponse({
      ...createdTask,
      creator: {
        id: createdTask.user_id,
        nickname: createdTask.creator_nickname,
        avatar: createdTask.creator_avatar,
        credit_score: createdTask.creator_credit_score,
        is_verified: createdTask.creator_is_verified
      },
      helper: null
    }, '发布任务成功')
  } catch (error) {
    console.error('Create task error:', error)
    return createErrorResponse(500, '发布任务失败', error.message)
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
