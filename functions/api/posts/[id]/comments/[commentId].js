import { getDb } from '../../../../lib/db.js'
import { createResponse, createErrorResponse } from '../../../../lib/response.js'

export async function onRequestDelete(context) {
  try {
    const { params, user } = context
    const db = getDb(context)

    const post = await db.get('SELECT id FROM posts WHERE id = ?', [params.id])
    if (!post) {
      return createErrorResponse(404, '动态不存在')
    }

    const comment = await db.get('SELECT * FROM comments WHERE id = ? AND post_id = ?', [params.commentId, params.id])
    if (!comment) {
      return createErrorResponse(404, '评论不存在')
    }

    if (comment.user_id !== user.id) {
      return createErrorResponse(403, '无权限删除此评论')
    }

    await db.delete('comments', 'id = ?', [params.commentId])

    return createResponse(null, '评论删除成功')
  } catch (error) {
    console.error('Delete comment error:', error)
    return createErrorResponse(500, '删除评论失败', error.message)
  }
}
