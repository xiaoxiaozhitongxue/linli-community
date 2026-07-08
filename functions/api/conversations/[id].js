import {
  createResponse,
  createErrorResponse,
  getDb,
  requireAuth,
  handleCors
} from '../../lib/index.js'

/**
 * GET /api/conversations/:id
 * 获取会话详情（含成员列表）
 */
export async function onRequestGet(context) {
  try {
    const authError = await requireAuth(context)
    if (authError) return authError

    const user = context.user
    const { id } = context.params
    const db = getDb(context)

    // 验证用户是会话成员
    const membership = await db.get(
      'SELECT 1 FROM conversation_members WHERE conversation_id = ? AND user_id = ?',
      [id, user.id]
    )
    if (!membership) {
      return createErrorResponse(403, '无权访问此会话')
    }

    const conv = await db.get('SELECT * FROM conversations WHERE id = ?', [id])
    if (!conv) {
      return createErrorResponse(404, '会话不存在')
    }

    // 获取成员列表
    const members = await db.query(`
      SELECT u.id, u.nickname, u.avatar, u.community, cm.joined_at
      FROM conversation_members cm
      JOIN users u ON u.id = cm.user_id
      WHERE cm.conversation_id = ?
      ORDER BY cm.joined_at ASC
    `, [id])

    // 获取最后一条消息
    const lastMessage = await db.get(
      'SELECT id, sender_id, content, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 1',
      [id]
    )

    return createResponse({
      ...conv,
      members,
      lastMessage
    }, '获取会话详情成功')
  } catch (error) {
    console.error('Get conversation error:', error)
    return createErrorResponse(500, '获取会话详情失败', error.message)
  }
}

export async function onRequestOptions() {
  return handleCors()
}
