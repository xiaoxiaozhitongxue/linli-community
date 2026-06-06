import {
  createResponse,
  createErrorResponse,
  getDb,
  requireAuth,
  now
} from '../../../lib/index.js'

async function getTaskById(db, id) {
  return await db.get(`
    SELECT 
      t.*,
      u.nickname as creator_nickname,
      u.avatar as creator_avatar,
      u.credit_score as creator_credit_score,
      u.is_verified as creator_is_verified,
      u.community as creator_community,
      h.nickname as helper_nickname,
      h.avatar as helper_avatar,
      h.credit_score as helper_credit_score,
      h.is_verified as helper_is_verified
    FROM tasks t
    JOIN users u ON t.user_id = u.id
    LEFT JOIN users h ON t.helper_id = h.id
    WHERE t.id = ?
  `, [id])
}

function formatTask(task) {
  return {
    ...task,
    creator: {
      id: task.user_id,
      nickname: task.creator_nickname,
      avatar: task.creator_avatar,
      credit_score: task.creator_credit_score,
      is_verified: task.creator_is_verified,
      community: task.creator_community
    },
    helper: task.helper_id ? {
      id: task.helper_id,
      nickname: task.helper_nickname,
      avatar: task.helper_avatar,
      credit_score: task.helper_credit_score,
      is_verified: task.helper_is_verified
    } : null
  }
}

export async function onRequestPost(context) {
  try {
    const authError = await requireAuth(context)
    if (authError) {
      return authError
    }

    const { id } = context.params
    const user = context.user
    const db = getDb(context)

    const task = await getTaskById(db, id)

    if (!task) {
      return createErrorResponse(404, '任务不存在')
    }

    // 发布者或帮助者都可以标记完成
    if (task.user_id !== user.id && task.helper_id !== user.id) {
      return createErrorResponse(403, '只有任务发布者或帮助者才能完成任务')
    }

    // 任务状态必须是 in_progress 才能完成
    if (task.status !== 'in_progress') {
      return createErrorResponse(400, '任务状态不允许完成，当前状态：' + task.status)
    }

    // 更新任务状态
    await db.run(`
      UPDATE tasks 
      SET status = 'completed', updated_at = ?
      WHERE id = ?
    `, [now(), id])

    // 增加帮助者的信用积分
    if (task.helper_id) {
      await db.run(`
        UPDATE users 
        SET credit_score = credit_score + 5, updated_at = ?
        WHERE id = ?
      `, [now(), task.helper_id])
    }

    const updatedTask = await getTaskById(db, id)
    return createResponse(formatTask(updatedTask), '任务已完成，感谢您的帮助！')
  } catch (error) {
    console.error('Complete task error:', error)
    return createErrorResponse(500, '完成任务失败', error.message)
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
