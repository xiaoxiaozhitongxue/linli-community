import {
  createResponse,
  createErrorResponse,
  getDb,
  requireAuth,
  now
} from '../../lib/index.js'

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

export async function onRequestGet(context) {
  try {
    const { id } = context.params
    const db = getDb(context)

    const task = await getTaskById(db, id)

    if (!task) {
      return createErrorResponse(404, '任务不存在')
    }

    return createResponse(formatTask(task), '获取任务详情成功')
  } catch (error) {
    console.error('Get task detail error:', error)
    return createErrorResponse(500, '获取任务详情失败', error.message)
  }
}

export async function onRequestPut(context) {
  try {
    const authError = await requireAuth(context)
    if (authError) {
      return authError
    }

    const { id } = context.params
    const user = context.user
    const db = getDb(context)
    const body = await context.request.json()

    const task = await getTaskById(db, id)

    if (!task) {
      return createErrorResponse(404, '任务不存在')
    }

    // 只有发布者可以更新任务
    if (task.user_id !== user.id) {
      return createErrorResponse(403, '无权修改此任务')
    }

    // 只有待处理状态可以更新
    if (task.status !== 'pending') {
      return createErrorResponse(400, '只能修改待接单状态的任务')
    }

    const { title, description, category, location, reward, deadline } = body
    const updates = []
    const params = []

    if (title !== undefined) {
      updates.push('title = ?')
      params.push(title)
    }

    if (description !== undefined) {
      updates.push('description = ?')
      params.push(description)
    }

    if (category !== undefined) {
      const validCategories = ['shopping', 'delivery', 'help', 'companionship', 'other']
      if (!validCategories.includes(category)) {
        return createErrorResponse(400, '无效的任务类型')
      }
      updates.push('category = ?')
      params.push(category)
    }

    if (location !== undefined) {
      updates.push('location = ?')
      params.push(location)
    }

    if (reward !== undefined) {
      updates.push('reward = ?')
      params.push(reward)
    }

    if (deadline !== undefined) {
      updates.push('deadline = ?')
      params.push(deadline ? new Date(deadline).getTime() / 1000 : null)
    }

    if (updates.length === 0) {
      return createErrorResponse(400, '没有需要更新的字段')
    }

    updates.push('updated_at = ?')
    params.push(now())
    params.push(id)

    await db.run(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, params)

    const updatedTask = await getTaskById(db, id)
    return createResponse(formatTask(updatedTask), '更新任务成功')
  } catch (error) {
    console.error('Update task error:', error)
    return createErrorResponse(500, '更新任务失败', error.message)
  }
}

export async function onRequestDelete(context) {
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

    // 只有发布者可以删除任务
    if (task.user_id !== user.id) {
      return createErrorResponse(403, '无权删除此任务')
    }

    // 已完成的任务不能删除
    if (task.status === 'completed') {
      return createErrorResponse(400, '已完成的任务不能删除')
    }

    await db.run('DELETE FROM tasks WHERE id = ?', [id])

    return createResponse({ id }, '删除任务成功')
  } catch (error) {
    console.error('Delete task error:', error)
    return createErrorResponse(500, '删除任务失败', error.message)
  }
}

export async function onRequestPost(context) {
  // 注：接单/完成/取消已拆分为独立的 /api/tasks/[id]/accept、/complete、/cancel 路由，
  // 前端 taskService 也只调用这三个独立路由，因此此处不再保留 action 分支（避免逻辑重复）。
  // 保留 POST 入口仅用于向前兼容提示，避免外部直接 POST 到本资源时静默失败。
  return createErrorResponse(
    405,
    '该接口不支持通用的 action 操作，请使用 /api/tasks/[id]/accept、/complete、/cancel'
  )
}

export function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}
