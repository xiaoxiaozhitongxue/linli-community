import {
  createResponse,
  createErrorResponse,
  createPaginatedResponse,
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
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 10, 50)
    const offset = (page - 1) * limit
    const type = url.searchParams.get('type') || 'all' // all, published, accepted

    let whereClause = ''
    let countWhereClause = ''
    let params = []
    let countParams = []

    if (type === 'published') {
      whereClause = 'WHERE t.user_id = ?'
      countWhereClause = 'WHERE user_id = ?'
      params = [user.id, limit, offset]
      countParams = [user.id]
    } else if (type === 'accepted') {
      whereClause = 'WHERE t.helper_id = ?'
      countWhereClause = 'WHERE helper_id = ?'
      params = [user.id, limit, offset]
      countParams = [user.id]
    } else {
      whereClause = 'WHERE t.user_id = ? OR t.helper_id = ?'
      countWhereClause = 'WHERE user_id = ? OR helper_id = ?'
      params = [user.id, user.id, limit, offset]
      countParams = [user.id, user.id]
    }

    // 获取我发布的任务和接单的任务
    const tasks = await db.query(`
      SELECT 
        t.*,
        u.nickname as creator_nickname,
        u.avatar as creator_avatar,
        u.credit_score as creator_credit_score,
        u.is_verified as creator_is_verified,
        u.community as creator_community,
        h.nickname as helper_nickname,
        h.avatar as helper_avatar,
        h.credit_score as helper_credit_score,
        h.is_verified as helper_is_verified
      FROM tasks t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN users h ON t.helper_id = h.id
      ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `, params)

    // 获取未读任务数量
    const totalResult = await db.get(`
      SELECT COUNT(*) as count FROM tasks ${countWhereClause}
    `, countParams)

    // 分类任务
    const publishedTasks = tasks.filter(t => t.user_id === user.id)
    const acceptedTasks = tasks.filter(t => t.helper_id === user.id)

    const formatTask = (task) => ({
      ...task,
      role: task.user_id === user.id ? 'creator' : 'helper',
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
        avatar: task.helper_avatar,
        credit_score: task.helper_credit_score,
        is_verified: task.helper_is_verified
      } : null
    })

    const formattedTasks = tasks.map(formatTask)

    // 按状态分组统计
    const stats = {
      total: totalResult.count,
      published: {
        all: publishedTasks.length,
        pending: publishedTasks.filter(t => t.status === 'pending').length,
        in_progress: publishedTasks.filter(t => t.status === 'in_progress').length,
        completed: publishedTasks.filter(t => t.status === 'completed').length
      },
      accepted: {
        all: acceptedTasks.length,
        pending: acceptedTasks.filter(t => t.status === 'pending').length,
        in_progress: acceptedTasks.filter(t => t.status === 'in_progress').length,
        completed: acceptedTasks.filter(t => t.status === 'completed').length
      }
    }

    return createResponse({
      items: formattedTasks,
      stats,
      pagination: {
        page,
        limit,
        total: totalResult.count,
        totalPages: Math.ceil(totalResult.count / limit)
      }
    }, '获取我的任务成功')
  } catch (error) {
    console.error('Get my tasks error:', error)
    return createErrorResponse(500, '获取我的任务失败', error.message)
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
