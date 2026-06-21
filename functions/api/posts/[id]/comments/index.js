import { getDb } from '../../../../lib/db.js'
import { createResponse, createErrorResponse, createPaginatedResponse } from '../../../../lib/response.js'
import { generateId, now, validateRequired, parseJsonBody, getQueryParams } from '../../../../lib/utils.js'
import { requireAuth } from '../../../../lib/auth.js'

async function getCommentsWithUserInfo(db, comments) {
  if (comments.length === 0) {
    return []
  }

  const userIds = [...new Set(comments.map(c => c.user_id))]
  let users = []
  if (userIds.length > 0) {
    users = await db.query(
      `SELECT id, nickname, avatar FROM users WHERE id IN (${userIds.map(() => '?').join(', ')})`,
      userIds
    )
  }
  const userMap = {}
  for (const user of users) {
    userMap[user.id] = user
  }

  return comments.map(comment => ({
    ...comment,
    user: userMap[comment.user_id] || null
  }))
}

export async function onRequestGet(context) {
  try {
    const { params } = context
    const db = getDb(context)
    const urlParams = getQueryParams(context.request)
    const page = parseInt(urlParams.page || '1')
    const limit = parseInt(urlParams.limit || '20')
    const offset = (page - 1) * limit

    const post = await db.get('SELECT id FROM posts WHERE id = ?', [params.id])
    if (!post) {
      return createErrorResponse(404, '动态不存在')
    }

    const comments = await db.query(
      'SELECT * FROM comments WHERE post_id = ? AND parent_comment_id IS NULL ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [params.id, limit, offset]
    )

    const countResult = await db.get(
      'SELECT COUNT(*) as total FROM comments WHERE post_id = ? AND parent_comment_id IS NULL',
      [params.id]
    )

    const commentsWithUsers = await getCommentsWithUserInfo(db, comments)

    return createPaginatedResponse(
      commentsWithUsers,
      page,
      limit,
      countResult.total
    )
  } catch (error) {
    console.error('Get comments error:', error)
    return createErrorResponse(500, '获取评论失败', error.message)
  }
}

export async function onRequestPost(context) {
  try {
    const { params, user } = context
    const db = getDb(context)

    const post = await db.get('SELECT id FROM posts WHERE id = ?', [params.id])
    if (!post) {
      return createErrorResponse(404, '动态不存在')
    }

    const body = await parseJsonBody(context.request)

    const missing = validateRequired(body, ['content'])
    if (missing.length > 0) {
      return createErrorResponse(400, '缺少必填字段', { missing })
    }

    const { content, parent_comment_id } = body

    if (parent_comment_id) {
      const parentComment = await db.get('SELECT id FROM comments WHERE id = ? AND post_id = ?', [parent_comment_id, params.id])
      if (!parentComment) {
        return createErrorResponse(404, '父评论不存在')
      }
    }

    const commentId = generateId()
    const timestamp = now()

    await db.insert('comments', {
      id: commentId,
      post_id: params.id,
      user_id: user.id,
      parent_comment_id: parent_comment_id || null,
      content,
      created_at: timestamp,
      updated_at: timestamp
    })

    const comment = await db.get('SELECT * FROM comments WHERE id = ?', [commentId])
    const commentsWithUsers = await getCommentsWithUserInfo(db, [comment])

    return createResponse(commentsWithUsers[0], '评论发布成功', 201)
  } catch (error) {
    console.error('Create comment error:', error)
    return createErrorResponse(500, '发布评论失败', error.message)
  }
}
