import {
  createResponse,
  createErrorResponse,
  createPaginatedResponse,
  getDb,
  requireAuth,
  generateId,
  now,
  parseJsonBody,
  validateRequired,
  getQueryParams,
  handleCors
} from '../../../../lib/index.js'

/**
 * GET /api/conversations/:id/messages
 * 获取会话的消息列表（分页，最新在前）
 * Query: ?page=1&limit=20
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

    const params = getQueryParams(context.request)
    const page = parseInt(params.page || '1')
    const limit = parseInt(params.limit || '20')
    const offset = (page - 1) * limit

    // 获取消息总数
    const countResult = await db.get(
      'SELECT COUNT(*) as total FROM messages WHERE conversation_id = ?',
      [id]
    )

    // 获取消息列表（最新在前，但返回时按时间正序排列便于前端展示）
    const messages = await db.query(`
      SELECT
        m.id,
        m.conversation_id,
        m.sender_id,
        m.content,
        m.created_at,
        u.nickname AS sender_nickname,
        u.avatar AS sender_avatar
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `, [id, limit, offset])

    // 反转回时间正序
    const items = messages.reverse().map(msg => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      senderId: msg.sender_id,
      senderName: msg.sender_nickname || '未知',
      senderAvatar: msg.sender_avatar || '',
      content: msg.content,
      createdAt: msg.created_at,
      isSelf: msg.sender_id === user.id
    }))

    return createPaginatedResponse(items, page, limit, countResult.total, '获取消息成功')
  } catch (error) {
    console.error('Get messages error:', error)
    return createErrorResponse(500, '获取消息失败', error.message)
  }
}

/**
 * POST /api/conversations/:id/messages
 * 发送消息
 * Body: { content: string }
 */
export async function onRequestPost(context) {
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
      return createErrorResponse(403, '无权在此会话发言')
    }

    const body = await parseJsonBody(context.request)
    const missing = validateRequired(body, ['content'])
    if (missing.length > 0) {
      return createErrorResponse(400, '消息内容不能为空', { missing })
    }

    const content = body.content.trim()
    if (!content) {
      return createErrorResponse(400, '消息内容不能为空')
    }

    const msgId = generateId()
    const timestamp = now()

    await db.insert('messages', {
      id: msgId,
      conversation_id: id,
      sender_id: user.id,
      content,
      created_at: timestamp
    })

    // 返回刚创建的消息
    const message = await db.get(`
      SELECT
        m.id,
        m.conversation_id,
        m.sender_id,
        m.content,
        m.created_at,
        u.nickname AS sender_nickname,
        u.avatar AS sender_avatar
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.id = ?
    `, [msgId])

    return createResponse({
      id: message.id,
      conversationId: message.conversation_id,
      senderId: message.sender_id,
      senderName: message.sender_nickname || '未知',
      senderAvatar: message.sender_avatar || '',
      content: message.content,
      createdAt: message.created_at,
      isSelf: true
    }, '发送成功', 201)
  } catch (error) {
    console.error('Send message error:', error)
    return createErrorResponse(500, '发送消息失败', error.message)
  }
}

export async function onRequestOptions() {
  return handleCors()
}
