// ============================================================================
// 全局搜索接口：GET /api/search?q=关键词
// 跨「帖子 / 互助任务 / 社区活动」三类内容做 LIKE 模糊匹配并聚合返回。
// 前端 search/index.vue 统一调用本接口，取代此前 3 次独立客户端拉取 + 前端过滤。
// ============================================================================
import { getDb } from '../lib/db.js'
import { createResponse, createErrorResponse } from '../lib/response.js'
import { getQueryParams } from '../lib/utils.js'

/** 将正文裁剪为纯文本摘要 */
function snippet(text) {
  if (!text) return ''
  const plain = String(text)
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return plain.length > 50 ? plain.slice(0, 50) + '…' : plain
}

function normalizePost(p) {
  return {
    id: p.id,
    type: 'post',
    title: p.content ? p.content.slice(0, 30) : '',
    content: p.content,
    snippet: snippet(p.content),
    location: p.location,
    author: p.author,
    author_avatar: p.author_avatar,
    like_count: p.like_count || 0,
    comment_count: p.comment_count || 0,
    created_at: p.created_at
  }
}

function normalizeTask(t) {
  return {
    id: t.id,
    type: 'task',
    title: t.title,
    content: t.description,
    snippet: snippet(t.description),
    category: t.category,
    status: t.status,
    reward: t.reward,
    author: t.author,
    created_at: t.created_at
  }
}

function normalizeActivity(a) {
  return {
    id: a.id,
    type: 'activity',
    title: a.title,
    content: a.description,
    snippet: snippet(a.description),
    category: a.category,
    status: a.status,
    location: a.location,
    start_time: a.start_time,
    author: a.author,
    created_at: a.created_at
  }
}

export async function onRequestGet(context) {
  try {
    const db = getDb(context)
    const params = getQueryParams(context.request)
    const q = (params.q || '').trim()
    const limit = Math.min(parseInt(params.limit || '20') || 20, 50)

    if (!q) {
      return createResponse(
        { query: '', posts: [], tasks: [], activities: [], total: 0 },
        '请输入搜索关键词'
      )
    }

    const like = `%${q}%`

    // 帖子：正文模糊匹配（仅公开内容）
    const posts = await db.query(
      `SELECT p.id, p.content, p.location, p.created_at, p.like_count, p.comment_count,
              u.nickname AS author, u.avatar AS author_avatar
       FROM posts p
       LEFT JOIN users u ON u.id = p.user_id
       WHERE p.visibility = 'public' AND p.content LIKE ?
       ORDER BY p.created_at DESC
       LIMIT ?`,
      [like, limit]
    )

    // 互助任务：标题 / 描述模糊匹配
    const tasks = await db.query(
      `SELECT t.id, t.title, t.description, t.category, t.status, t.reward, t.created_at,
              u.nickname AS author
       FROM tasks t
       LEFT JOIN users u ON u.id = t.user_id
       WHERE t.title LIKE ? OR t.description LIKE ?
       ORDER BY t.created_at DESC
       LIMIT ?`,
      [like, like, limit]
    )

    // 社区活动：标题 / 描述模糊匹配
    const activities = await db.query(
      `SELECT a.id, a.title, a.description, a.category, a.status, a.location, a.start_time, a.created_at,
              u.nickname AS author
       FROM activities a
       LEFT JOIN users u ON u.id = a.user_id
       WHERE a.title LIKE ? OR a.description LIKE ?
       ORDER BY a.created_at DESC
       LIMIT ?`,
      [like, like, limit]
    )

    const total = posts.length + tasks.length + activities.length

    return createResponse(
      {
        query: q,
        posts: posts.map(normalizePost),
        tasks: tasks.map(normalizeTask),
        activities: activities.map(normalizeActivity),
        total
      },
      '搜索成功'
    )
  } catch (error) {
    console.error('Search error:', error)
    return createErrorResponse(500, '搜索失败', error.message)
  }
}
