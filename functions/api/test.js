import { createResponse, createErrorResponse, getDb, generateId, now, validateRequired } from '../lib/index.js'

export async function onRequestGet(context) {
  try {
    const db = getDb(context)

    const result = await db.query('SELECT sqlite_version() as version')

    return createResponse({
      message: 'API 测试成功',
      sqliteVersion: result.results[0].version,
      timestamp: now()
    })
  } catch (error) {
    console.error('Test API error:', error)
    return createErrorResponse(500, '测试失败', error.message)
  }
}

export async function onRequestPost(context) {
  try {
    const { request } = context
    const body = await request.json()

    const missing = validateRequired(body, ['name', 'email'])
    if (missing.length > 0) {
      return createErrorResponse(400, '缺少必要字段', { missing })
    }

    const testData = {
      id: generateId(),
      name: body.name,
      email: body.email,
      created_at: now()
    }

    return createResponse({
      received: testData,
      message: '数据接收成功'
    })
  } catch (error) {
    console.error('Test POST error:', error)
    return createErrorResponse(500, '处理请求失败', error.message)
  }
}
