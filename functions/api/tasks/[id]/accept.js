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

    // 不能接自己发布的任务
    if (task.user_id === user.id) {
      return createErrorResponse(400, '不能接自己发布的任务')
    }

    // 任务状态必须是 pending 才能接单
    if (task.status !== 'pending') {
      return createErrorResponse(400, '任务状态不允许接单，当前状态：' + task.status)
    }

    // 检查是否已有帮助者
    if (task.helper_id) {
      return createErrorResponse(400, '该任务已被其他用户接单')
    }

    // 更新任务状态
    await db.run(`
      UPDATE tasks 
      SET helper_id = ?, status = 'in_progress', updated_at = ?
      WHERE id = ?
    `, [user.id, now(), id])

    const updatedTask = await getTaskById(db, id)
    return createResponse(formatTask(updatedTask), '接单成功')
  } catch (error) {
    console.error('Accept task error:', error)
    return createErrorResponse(500, '接单失败', error.message)
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
