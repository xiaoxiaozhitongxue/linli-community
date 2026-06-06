import {
  createResponse,
  createErrorResponse,
  getDb,
  requireAuth,
  now
} from '../../../lib/index.js'


export async function onRequestPost(context) {
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

    if (activity.status !== 'upcoming' && activity.status !== 'ongoing') {
      return createErrorResponse(400, '活动已结束或已取消')
    }

    if (activity.max_participants && activity.current_participants >= activity.max_participants) {
      return createErrorResponse(400, '活动名额已满')
    }

    const existingParticipant = await db.get(`
      SELECT id FROM activity_participants 
      WHERE activity_id = ? AND user_id = ?
    `, [id, user.id])

    if (existingParticipant) {
      return createErrorResponse(400, '已报名该活动')
    }

    const participantId = crypto.randomUUID()
    await db.run(`
      INSERT INTO activity_participants (id, activity_id, user_id, joined_at, status)
      VALUES (?, ?, ?, ?, 'registered')
    `, [participantId, id, user.id, now()])

    await db.run(`
      UPDATE activities 
      SET current_participants = current_participants + 1, updated_at = ?
      WHERE id = ?
    `, [now(), id])

    const participant = await db.get(`
      SELECT * FROM activity_participants WHERE id = ?
    `, [participantId])

    return createResponse(participant, '报名成功')
  } catch (error) {
    console.error('Join activity error:', error)
    return createErrorResponse(500, '报名失败', error.message)
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
