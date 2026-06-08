import {
  createResponse,
  createErrorResponse,
  getDb,
  requireAuth,
  now
} from '../../lib/index.js'

async function getActivityWithDetails(db, activityId, userId) {
  const activity = await db.get(`
    SELECT a.*, u.nickname, u.avatar, u.community
    FROM activities a
    JOIN users u ON a.user_id = u.id
    WHERE a.id = ?
  `, [activityId])

  if (!activity) {
    return null
  }

  // 获取参与者信息
  const participants = await db.query(`
    SELECT ap.*, u.nickname, u.avatar
    FROM activity_participants ap
    JOIN users u ON ap.user_id = u.id
    WHERE ap.activity_id = ?
    ORDER BY ap.joined_at ASC
  `, [activityId])

  // 检查当前用户是否已参加
  let isParticipant = false
  if (userId) {
    const check = await db.get(
      'SELECT id FROM activity_participants WHERE activity_id = ? AND user_id = ?',
      [activityId, userId]
    )
    isParticipant = !!check
  }

  return {
    ...activity,
    images: activity.images ? JSON.parse(activity.images) : [],
    user: {
      id: activity.user_id,
      nickname: activity.nickname,
      avatar: activity.avatar,
      community: activity.community
    },
    is_participant: isParticipant,
    participants: participants.map(p => ({
      id: p.id,
      user_id: p.user_id,
      nickname: p.nickname,
      avatar: p.avatar,
      joined_at: p.joined_at,
      status: p.status
    }))
  }
}

export async function onRequestGet(context) {
  try {
    const { id } = context.params
    const db = getDb(context)

    let userId = null
    try {
      const authError = await requireAuth(context)
      if (!authError) {
        userId = context.user.id
      }
    } catch (e) {
    }

    const activity = await getActivityWithDetails(db, id, userId)
    if (!activity) {
      return createErrorResponse(404, '活动不存在')
    }

    return createResponse(activity, '获取活动成功')
  } catch (error) {
    console.error('Get activity error:', error)
    return createErrorResponse(500, '获取活动失败', error.message)
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

    // 获取活动
    const activity = await db.get('SELECT * FROM activities WHERE id = ?', [id])
    if (!activity) {
      return createErrorResponse(404, '活动不存在')
    }

    // 检查权限 - 只有创建者可以更新
    if (activity.user_id !== user.id) {
      return createErrorResponse(403, '无权限编辑此活动')
    }

    const {
      title,
      description,
      category,
      location,
      start_time,
      end_time,
      max_participants,
      images,
      status
    } = body

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
      const validCategories = ['sports', 'culture', 'charity', 'party', 'other']
      if (!validCategories.includes(category)) {
        return createErrorResponse(400, '无效的活动类型')
      }
      updates.push('category = ?')
      params.push(category)
    }

    if (location !== undefined) {
      updates.push('location = ?')
      params.push(location)
    }

    if (start_time !== undefined) {
      updates.push('start_time = ?')
      params.push(new Date(start_time).getTime() / 1000)
    }

    if (end_time !== undefined) {
      updates.push('end_time = ?')
      params.push(end_time ? new Date(end_time).getTime() / 1000 : null)
    }

    if (max_participants !== undefined) {
      updates.push('max_participants = ?')
      params.push(max_participants)
    }

    if (images !== undefined) {
      updates.push('images = ?')
      params.push(images ? JSON.stringify(images) : null)
    }

    if (status !== undefined) {
      const validStatuses = ['upcoming', 'ongoing', 'completed', 'cancelled']
      if (!validStatuses.includes(status)) {
        return createErrorResponse(400, '无效的活动状态')
      }
      updates.push('status = ?')
      params.push(status)
    }

    if (updates.length === 0) {
      return createErrorResponse(400, '没有需要更新的字段')
    }

    updates.push('updated_at = ?')
    params.push(now())
    params.push(id)

    await db.run(`UPDATE activities SET ${updates.join(', ')} WHERE id = ?`, params)

    const updatedActivity = await getActivityWithDetails(db, id, user.id)
    return createResponse(updatedActivity, '更新活动成功')
  } catch (error) {
    console.error('Update activity error:', error)
    return createErrorResponse(500, '更新活动失败', error.message)
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

    // 获取活动
    const activity = await db.get('SELECT * FROM activities WHERE id = ?', [id])
    if (!activity) {
      return createErrorResponse(404, '活动不存在')
    }

    // 检查权限 - 只有创建者可以删除
    if (activity.user_id !== user.id) {
      return createErrorResponse(403, '无权限删除此活动')
    }

    // 删除活动（关联的参与者会通过外键级联删除）
    await db.run('DELETE FROM activities WHERE id = ?', [id])

    return createResponse({ id }, '删除活动成功')
  } catch (error) {
    console.error('Delete activity error:', error)
    return createErrorResponse(500, '删除活动失败', error.message)
  }
}

export function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}
