import { getDb } from '../../lib/db.js'
import { createResponse, createErrorResponse } from '../../lib/response.js'
import { generateId, now, validateRequired, parseJsonBody } from '../../lib/utils.js'
import { requireAuth } from '../../lib/auth.js'

async function getPostWithUserInfo(db, postId, userId) {
  const post = await db.get('SELECT * FROM posts WHERE id = ?', [postId])
  if (!post) {
    return null
  }

  const user = await db.get('SELECT id, nickname, avatar, community FROM users WHERE id = ?', [post.user_id])

  let isLiked = false
  if (userId) {
    const like = await db.get(
      'SELECT id FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?',
      [userId, 'post', postId]
    )
    isLiked = !!like
  }

  return {
    ...post,
    user: user || null,
    is_liked: isLiked,
    images: post.images ? JSON.parse(post.images) : []
  }
}

export async function onRequestGet(context) {
  try {
    const { params } = context
    const db = getDb(context)

    let userId = null
    try {
      const authError = await requireAuth(context)
      if (!authError) {
        userId = context.user.id
      }
    } catch (e) {
    }

    const post = await getPostWithUserInfo(db, params.id, userId)
    if (!post) {
      return createErrorResponse(404, '动态不存在')
    }

    // 增加阅读数
    await db.execute(
      'UPDATE posts SET view_count = COALESCE(view_count, 0) + 1 WHERE id = ?',
      [params.id]
    )
    post.view_count = (post.view_count || 0) + 1

    return createResponse(post)
  } catch (error) {
    console.error('Get post error:', error)
    return createErrorResponse(500, '获取动态失败', error.message)
  }
}

export async function onRequestPut(context) {
  try {
    const authError = await requireAuth(context)
    if (authError) {
      return authError
    }
    const { params } = context
    const user = context.user
    const db = getDb(context)

    const post = await db.get('SELECT * FROM posts WHERE id = ?', [params.id])
    if (!post) {
      return createErrorResponse(404, '动态不存在')
    }

    if (post.user_id !== user.id) {
      return createErrorResponse(403, '无权限编辑此动态')
    }

    const body = await parseJsonBody(context.request)
    const { content, images, location, visibility } = body

    const updateData = {
      updated_at: now()
    }

    if (content !== undefined) updateData.content = content
    if (images !== undefined) updateData.images = images ? JSON.stringify(images) : null
    if (location !== undefined) updateData.location = location
    if (visibility !== undefined) updateData.visibility = visibility

    await db.update('posts', updateData, 'id = ?', [params.id])

    const updatedPost = await getPostWithUserInfo(db, params.id, user.id)

    return createResponse(updatedPost, '动态更新成功')
  } catch (error) {
    console.error('Update post error:', error)
    return createErrorResponse(500, '更新动态失败', error.message)
  }
}

export async function onRequestDelete(context) {
  try {
    const authError = await requireAuth(context)
    if (authError) {
      return authError
    }
    const { params } = context
    const user = context.user
    const db = getDb(context)

    const post = await db.get('SELECT * FROM posts WHERE id = ?', [params.id])
    if (!post) {
      return createErrorResponse(404, '动态不存在')
    }

    if (post.user_id !== user.id) {
      return createErrorResponse(403, '无权限删除此动态')
    }

    await db.delete('posts', 'id = ?', [params.id])

    return createResponse(null, '动态删除成功')
  } catch (error) {
    console.error('Delete post error:', error)
    return createErrorResponse(500, '删除动态失败', error.message)
  }
}
