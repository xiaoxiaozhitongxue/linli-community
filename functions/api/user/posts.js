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

    const posts = await db.query(`
      SELECT 
        p.*,
        u.nickname as author_nickname,
        u.avatar as author_avatar
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [user.id, limit, offset])

    const totalCount = await db.get(`
      SELECT COUNT(*) as count FROM posts WHERE user_id = ?
    `, [user.id])

    const formattedPosts = posts.map(post => ({
      ...post,
      images: post.images ? JSON.parse(post.images) : [],
      user: {
        id: post.user_id,
        nickname: post.author_nickname,
        avatar: post.author_avatar
      }
    }))

    return createResponse({
      items: formattedPosts,
      page,
      limit,
      total: totalCount.count,
      total_pages: Math.ceil(totalCount.count / limit)
    }, '获取动态成�?)
  } catch (error) {
    console.error('Get user posts error:', error)
    return createErrorResponse(500, '获取动态失�?, error.message)
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
