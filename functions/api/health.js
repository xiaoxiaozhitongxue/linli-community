import { createResponse, getDb } from '../lib/index.js'

export async function onRequestGet(context) {
  try {
    const db = getDb(context)

    const dbCheck = await db.query('SELECT 1 as ok')

    return createResponse({
      status: 'healthy',
      services: {
        api: 'ok',
        database: dbCheck.length > 0 ? 'ok' : 'error'
      },
      timestamp: Date.now()
    })
  } catch (error) {
    return createResponse({
      status: 'unhealthy',
      error: error.message,
      timestamp: Date.now()
    }, '服务状态检查', 503)
  }
}
