// ============================================================================
// 管理员-帖子列表接口：GET /api/admin/posts
// 返回所有帖子列表（含作者信息），仅管理员可访问
// ============================================================================
import { getDb } from '../../lib/db.js'
import { createResponse, createErrorResponse } from '../../lib/response.js'

export async function onRequestGet(context) {
  try {
    const db = getDb(context)

    // 获取所有帖子（含作者信息）
    const posts = await db.query(
      `SELECT p.id, p.content, p.like_count, p.comment_count, p.visibility, p.created_at,
              u.nickname AS author
       FROM posts p
       LEFT JOIN users u ON u.id = p.user_id
       ORDER BY p.created_at DESC
       LIMIT 200`
    )

    // 解析 images JSON 字段（兼容性）
    const items = posts.map(p => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : []
    }))

    const total = await db.get('SELECT COUNT(*) as cnt FROM posts')

    return createResponse({
      posts: items,
      total: total?.cnt || 0
    }, '获取成功')
  } catch (error) {
    console.error('Admin get posts error:', error)
    return createErrorResponse(500, '获取帖子列表失败', error.message)
  }
}
