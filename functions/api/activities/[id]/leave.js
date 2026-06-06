import {
  createResponse,
  createErrorResponse,
  getDb,
  requireAuth,
  now
} from '../../../lib/index.js'


export async function onRequestDelete(context) {
  try {
    const authError = await requireAuth(context)
    if (authError) {
      return authError
    }

    const { id } = context.params
    const user = context.user
    const db = getDb(context)

    const activity = await db.get('SELECT * FROM activities WHERE id = ?', [id])
    if (!activity) {
      return createErrorResponse(404, '活动不存在')
    }

    const participant = await db.get(`
      SELECT * FROM activity_participants 
      WHERE activity_id = ? AND user_id = ?
    `, [id, user.id])

    if (!participant) {
      return createErrorResponse(400, '未报名该活动')
    }

    await db.run(`
      DELETE FROM activity_participants WHERE id = ?
    `, [participant.id])

    await db.run(`
      UPDATE activities 
      SET current_participants = MAX(0, current_participants - 1), updated_at = ?
      WHERE id = ?
    `, [now(), id])

    return createResponse(null, '取消报名成功')
  } catch (error) {
    console.error('Leave activity error:', error)
    return createErrorResponse(500, '取消报名失败', error.message)
  }
}

export function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}
