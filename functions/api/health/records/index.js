import {
  createResponse,
  createPaginatedResponse,
  createErrorResponse,
  getDb,
  requireAuth,
  generateId,
  now,
  getQueryParams,
  parseJsonBody
} from '../../../lib/index.js'

export async function onRequestGet(context) {
  try {
    const authError = await requireAuth(context)
    if (authError) {
      return authError
    }

    const user = context.user
    const db = getDb(context)
    const params = getQueryParams(context.request)

    const page = parseInt(params.page) || 1
    const limit = Math.min(parseInt(params.limit) || 50, 100)
    const offset = (page - 1) * limit

    const countResult = await db.get(
      'SELECT COUNT(*) as total FROM health_records WHERE user_id = ?',
      [user.id]
    )
    const total = countResult.total || 0

    const records = await db.query(
      `SELECT id, date, health_status, temperature, notes, timestamp, created_at
       FROM health_records
       WHERE user_id = ?
       ORDER BY date DESC
       LIMIT ? OFFSET ?`,
      [user.id, limit, offset]
    )

    return createPaginatedResponse(records, page, limit, total, '获取健康打卡记录成功')
  } catch (error) {
    console.error('Get health records error:', error)
    return createErrorResponse(500, '获取健康打卡记录失败', error.message)
  }
}

export async function onRequestPost(context) {
  try {
    const authError = await requireAuth(context)
    if (authError) {
      return authError
    }

    const user = context.user
    const db = getDb(context)
    const body = await parseJsonBody(context.request)

    const { date, health_status, temperature, notes } = body

    // 如果没传 date，默认今天
    const recordDate = date || formatDateKey(new Date())

    // 检查是否已打卡
    const existing = await db.get(
      'SELECT id FROM health_records WHERE user_id = ? AND date = ?',
      [user.id, recordDate]
    )

    if (existing) {
      return createErrorResponse(400, '今日已打卡，不能重复打卡')
    }

    const id = generateId()
    const timestamp = now()

    await db.run(
      `INSERT INTO health_records (id, user_id, date, health_status, temperature, notes, timestamp, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        user.id,
        recordDate,
        health_status || 'good',
        temperature || null,
        notes || null,
        timestamp,
        timestamp
      ]
    )

    return createResponse({
      id,
      date: recordDate,
      health_status: health_status || 'good',
      temperature: temperature || null,
      notes: notes || null,
      timestamp
    }, '打卡成功')
  } catch (error) {
    console.error('Create health record error:', error)
    return createErrorResponse(500, '打卡失败，请重试', error.message)
  }
}

function formatDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}
