import { getDb } from '../../../lib/db.js'
import { createResponse, createErrorResponse } from '../../../lib/response.js'
import { generateId, now } from '../../../lib/utils.js'


export async function onRequestPost(context) {
  try {
    const { params, user } = context
    const db = getDb(context)

    const post = await db.get('SELECT * FROM posts WHERE id = ?', [params.id])
    if (!post) {
      return createErrorResponse(404, '动态不存在')
    }

    const existingLike = await db.get(
      'SELECT id FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?',
      [user.id, 'post', params.id]
    )

    let isLiked = false

    if (existingLike) {
      await db.delete('likes', 'user_id = ? AND target_type = ? AND target_id = ?', [user.id, 'post', params.id])
      isLiked = false
    } else {
      await db.insert('likes', {
        id: generateId(),
        user_id: user.id,
        target_type: 'post',
        target_id: params.id,
        created_at: now()
      })
      isLiked = true
    }

    const updatedPost = await db.get('SELECT * FROM posts WHERE id = ?', [params.id])

    return createResponse({
      liked: isLiked,
      like_count: updatedPost.like_count
    }, isLiked ? '点赞成功' : '取消点赞成功')
  } catch (error) {
    console.error('Like post error:', error)
    return createErrorResponse(500, '操作失败', error.message)
  }
}
