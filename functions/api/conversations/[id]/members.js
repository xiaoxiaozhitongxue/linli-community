import {
  createResponse,
  createErrorResponse,
  getDb,
  requireAuth,
  generateId,
  now,
  parseJsonBody,
  validateRequired,
  handleCors
} from '../../../lib/index.js'

/**
 * POST /api/conversations/:id/members
 * 添加成员（群聊用）
 * Body: { user_ids: string[] }
 */
export async function onRequestPost(context) {
  try {
    const authError = await requireAuth(context)
    if (authError) return authError

    const user = context.user
    const { id } = context.params
    const db = getDb(context)

    // 验证会话存在且为群聊
    const conv = await db.get('SELECT * FROM conversations WHERE id = ?', [id])
    if (!conv) {
      return createErrorResponse(404, '会话不存在')
    }
    if (conv.type !== 'group') {
      return createErrorResponse(400, '仅群聊支持添加成员')
    }

    // 验证当前用户是成员
    const membership = await db.get(
      'SELECT 1 FROM conversation_members WHERE conversation_id = ? AND user_id = ?',
      [id, user.id]
    )
    if (!membership) {
      return createErrorResponse(403, '无权管理此群聊')
    }

    const body = await parseJsonBody(context.request)
    const missing = validateRequired(body, ['user_ids'])
    if (missing.length > 0) {
      return createErrorResponse(400, '请指定要添加的用户', { missing })
    }

    const { user_ids } = body
    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      return createErrorResponse(400, '用户列表不能为空')
    }

    const timestamp = now()
    const addedUsers = []
    const errors = []

    for (const userId of user_ids) {
      try {
        // 检查是否已是成员
        const existing = await db.get(
          'SELECT 1 FROM conversation_members WHERE conversation_id = ? AND user_id = ?',
          [id, userId]
        )
        if (existing) {
          errors.push(`用户 ${userId} 已是群成员`)
          continue
        }

        // 检查用户是否存在
        const targetUser = await db.get('SELECT id, nickname FROM users WHERE id = ?', [userId])
        if (!targetUser) {
          errors.push(`用户 ${userId} 不存在`)
          continue
        }

        await db.insert('conversation_members', {
          conversation_id: id,
          user_id: userId,
          joined_at: timestamp
        })
        addedUsers.push(targetUser)
      } catch (e) {
        errors.push(`添加用户 ${userId} 失败: ${e.message}`)
      }
    }

    // 插入系统消息
    if (addedUsers.length > 0) {
      const names = addedUsers.map(u => u.nickname || u.id).join('、')
      await db.insert('messages', {
        id: generateId(),
        conversation_id: id,
        sender_id: user.id,
        content: `${user.nickname || '用户'} 邀请了 ${names} 加入群聊`,
        created_at: timestamp
      })
    }

    return createResponse({
      added: addedUsers.map(u => ({ id: u.id, nickname: u.nickname })),
      errors
    }, addedUsers.length > 0 ? '添加成员成功' : '未添加任何成员')
  } catch (error) {
    console.error('Add members error:', error)
    return createErrorResponse(500, '添加成员失败', error.message)
  }
}

export async function onRequestOptions() {
  return handleCors()
}
