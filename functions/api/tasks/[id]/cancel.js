import {
  createResponse,
  createErrorResponse,
  getDb,
  requireAuth,
  now
} from '../../../../lib/index.js'

export async function onRequestPost(context) {
  try {
    const authError = await requireAuth(context)
    if (authError) {
      return authError
    }

    const { id } = context.params
    const user = context.user
    const db = getDb(context)

    const task = await db.get(
      `SELECT t.*,
              u.nickname as creator_nickname, u.avatar as creator_avatar,
              u.credit_score as creator_credit_score, u.is_verified as creator_is_verified,
              u.community as creator_community
       FROM tasks t
       JOIN users u ON t.user_id = u.id
       WHERE t.id = ?`,
      [id]
    )

    if (!task) {
      return createErrorResponse(404, '任务不存在')
    }

    // 只有发布者可以取消
    if (task.user_id !== user.id) {
      return createErrorResponse(403, '只有任务发布者才能取消任务')
    }

    // 只有待处理或进行中的任务可以取消
    if (!['pending', 'in_progress'].includes(task.status)) {
      return createErrorResponse(400, `当前任务状态不允许取消，状态：${task.status}`)
    }

    await db.run(
      `UPDATE tasks SET status = 'cancelled', updated_at = ? WHERE id = ?`,
      [now(), id]
    )

    const updatedTask = await db.get(
      `SELECT t.*, u.nickname as creator_nickname, u.avatar as creator_avatar,
              u.credit_score as creator_credit_score, u.is_verified as creator_is_verified
       FROM tasks t
       JOIN users u ON t.user_id = u.id
       WHERE t.id = ?`,
      [id]
    )

    return createResponse(updatedTask, '任务已取消')
  } catch (error) {
    console.error('Cancel task error:', error)
    return createErrorResponse(500, '取消任务失败', error.message)
  }
}

export function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}
