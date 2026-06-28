import {
  createResponse,
  createErrorResponse,
  getDb,
  requireAuth,
  now
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

    const favorites = await db.query(`
      SELECT 
        l.*
      FROM likes l
      WHERE l.user_id = ? AND l.target_type IN ('post', 'activity')
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?
    `, [user.id, limit, offset])

    const totalCount = await db.get(`
      SELECT COUNT(*) as count FROM likes 
      WHERE user_id = ? AND target_type IN ('post', 'activity')
    `, [user.id])

    const formattedFavorites = []
    for (const favorite of favorites) {
      let target = null
      
      if (favorite.target_type === 'post') {
        const post = await db.get(`
          SELECT p.*, u.nickname, u.avatar 
          FROM posts p 
          JOIN users u ON p.user_id = u.id 
          WHERE p.id = ?
        `, [favorite.target_id])
        
        if (post) {
          target = {
            ...post,
            images: post.images ? JSON.parse(post.images) : [],
            user: {
              id: post.user_id,
              nickname: post.nickname,
              avatar: post.avatar
            }
          }
        }
      } else if (favorite.target_type === 'activity') {
        const activity = await db.get(`
          SELECT a.*, u.nickname, u.avatar 
          FROM activities a 
          JOIN users u ON a.user_id = u.id 
          WHERE a.id = ?
        `, [favorite.target_id])
        
        if (activity) {
          target = {
            ...activity,
            images: activity.images ? JSON.parse(activity.images) : [],
            user: {
              id: activity.user_id,
              nickname: activity.nickname,
              avatar: activity.avatar
            }
          }
        }
      }

      formattedFavorites.push({
        ...favorite,
        target
      })
    }

    return createResponse({
      items: formattedFavorites,
      page,
      limit,
      total: totalCount.count,
      total_pages: Math.ceil(totalCount.count / limit)
    }, '获取收藏成功')
  } catch (error) {
    console.error('Get user favorites error:', error)
    return createErrorResponse(500, '获取收藏失败', error.message)
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
    const { target_type, target_id } = body

    if (!target_type || !target_id) {
      return createErrorResponse(400, '缺少必要参数')
    }

    if (!['post', 'comment', 'activity'].includes(target_type)) {
      return createErrorResponse(400, '不支持的收藏类型')
    }

    const existingLike = await db.get(`
      SELECT id FROM likes 
      WHERE user_id = ? AND target_type = ? AND target_id = ?
    `, [user.id, target_type, target_id])

    let favorited = false

    if (existingLike) {
      await db.run(`
        DELETE FROM likes WHERE id = ?
      `, [existingLike.id])
    } else {
      const id = generateId()
      await db.run(`
        INSERT INTO likes (id, user_id, target_type, target_id, created_at)
        VALUES (?, ?, ?, ?, ?)
      `, [id, user.id, target_type, target_id, now()])
      favorited = true
    }

    return createResponse({ favorited }, favorited ? '收藏成功' : '取消收藏成功')
  } catch (error) {
    console.error('Toggle favorite error:', error)
    return createErrorResponse(500, '操作失败', error.message)
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
