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
} from '../../lib/index.js'

/**
 * GET /api/conversations
 * 列出当前用户的所有会话（含最后一条消息摘要）
 */
export async function onRequestGet(context) {
  try {
    const authError = await requireAuth(context)
    if (authError) return authError

    const user = context.user
    const db = getDb(context)

    // 查出用户参与的所有会话
    const conversations = await db.query(`
      SELECT
        c.id,
        c.type,
        c.name,
        c.created_by,
        c.created_at,
        (SELECT m.content FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message,
        (SELECT m.created_at FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message_at,
        (SELECT COUNT(*) FROM conversation_members cm WHERE cm.conversation_id = c.id) AS member_count
      FROM conversations c
      JOIN conversation_members cm ON cm.conversation_id = c.id
      WHERE cm.user_id = ?
      ORDER BY last_message_at DESC, c.created_at DESC
    `, [user.id])

    // 为每个会话补充对方用户信息（私聊）或群名称
    const result = []
    for (const conv of conversations) {
      const item = {
        id: conv.id,
        type: conv.type,
        name: conv.name,
        created_by: conv.created_by,
        created_at: conv.created_at,
        lastMessage: conv.last_message || '',
        lastMessageAt: conv.last_message_at || conv.created_at,
        memberCount: conv.member_count || 0
      }

      if (conv.type === 'private') {
        // 私聊：找到对方用户信息作为会话展示名和头像
        const otherMembers = await db.query(`
          SELECT u.id, u.nickname, u.avatar
          FROM conversation_members cm
          JOIN users u ON u.id = cm.user_id
          WHERE cm.conversation_id = ? AND cm.user_id != ?
          LIMIT 1
        `, [conv.id, user.id])
        if (otherMembers.length > 0) {
          item.otherUser = {
            id: otherMembers[0].id,
            nickname: otherMembers[0].nickname,
            avatar: otherMembers[0].avatar
          }
          // 私聊默认以对方昵称作为会话名
          if (!item.name) {
            item.name = otherMembers[0].nickname || '邻居'
          }
        }
        item.avatar = otherMembers?.[0]?.avatar || ''
      } else {
        // 群聊
        item.avatar = ''
      }

      result.push(item)
    }

    return createResponse(result, '获取会话列表成功')
  } catch (error) {
    console.error('Get conversations error:', error)
    return createErrorResponse(500, '获取会话列表失败', error.message)
  }
}

/**
 * POST /api/conversations
 * 创建新会话（私聊或群聊）
 * Body: { type: 'private'|'group', name?: string, member_ids: string[] }
 */
export async function onRequestPost(context) {
  try {
    const authError = await requireAuth(context)
    if (authError) return authError

    const user = context.user
    const db = getDb(context)
    const body = await parseJsonBody(context.request)

    const missing = validateRequired(body, ['type', 'member_ids'])
    if (missing.length > 0) {
      return createErrorResponse(400, '缺少必填字段', { missing })
    }

    const { type, name, member_ids } = body
    if (type !== 'private' && type !== 'group') {
      return createErrorResponse(400, '无效的会话类型，仅支持 private 或 group')
    }
    if (!Array.isArray(member_ids) || member_ids.length === 0) {
      return createErrorResponse(400, '成员列表不能为空')
    }

    // 创建者自动加入成员列表
    const allMemberIds = [...new Set([user.id, ...member_ids])]

    // 私聊：检查是否已存在双向会话（两人之间的私聊只能有一个）
    if (type === 'private') {
      const otherId = member_ids[0]
      if (!otherId) {
        return createErrorResponse(400, '私聊需要指定对方用户')
      }
      const existing = await db.query(`
        SELECT c.id FROM conversations c
        WHERE c.type = 'private'
          AND (SELECT COUNT(*) FROM conversation_members WHERE conversation_id = c.id) = 2
          AND EXISTS (SELECT 1 FROM conversation_members WHERE conversation_id = c.id AND user_id = ?)
          AND EXISTS (SELECT 1 FROM conversation_members WHERE conversation_id = c.id AND user_id = ?)
      `, [user.id, otherId])
      if (existing.length > 0) {
        // 已存在，返回现有会话
        const conv = await db.get('SELECT * FROM conversations WHERE id = ?', [existing[0].id])
        return createResponse(conv, '已存在会话', 200)
      }
    }

    const convId = generateId()
    const timestamp = now()

    // 群聊默认名称
    const convName = name || (type === 'private' ? '' : '群聊')

    await db.insert('conversations', {
      id: convId,
      type,
      name: convName,
      created_by: user.id,
      created_at: timestamp
    })

    // 批量插入成员
    const memberStmts = allMemberIds.map(memberId => ({
      sql: 'INSERT INTO conversation_members (conversation_id, user_id, joined_at) VALUES (?, ?, ?)',
      params: [convId, memberId, timestamp]
    }))
    await db.batch(memberStmts)

    // 群聊插入一条系统消息
    if (type === 'group') {
      await db.insert('messages', {
        id: generateId(),
        conversation_id: convId,
        sender_id: user.id,
        content: `${user.nickname || '用户'} 创建了群聊`,
        created_at: timestamp
      })
    }

    const created = await db.get('SELECT * FROM conversations WHERE id = ?', [convId])

    return createResponse(created, '创建会话成功', 201)
  } catch (error) {
    console.error('Create conversation error:', error)
    return createErrorResponse(500, '创建会话失败', error.message)
  }
}

export async function onRequestOptions() {
  return handleCors()
}
