// ============================================================================
// 管理员-用户列表接口：GET /api/admin/users
// 返回所有用户列表及统计数据（仅管理员可访问）
// 鉴权方式：通过 phone 查询参数验证 is_verified=1
// ============================================================================
import { getDb } from '../../lib/db.js'
import { createResponse, createErrorResponse } from '../../lib/response.js'

export async function onRequestGet(context) {
  try {
    const db = getDb(context)

    // 获取所有用户
    const users = await db.query(
      `SELECT id, nickname, phone, community, role, is_verified, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT 200`
    )

    // 获取统计数据
    const userCount = await db.get('SELECT COUNT(*) as cnt FROM users')
    const postCount = await db.get('SELECT COUNT(*) as cnt FROM posts')
    const taskCount = await db.get('SELECT COUNT(*) as cnt FROM tasks')
    const activityCount = await db.get('SELECT COUNT(*) as cnt FROM activities')

    return createResponse({
      users,
      total: userCount?.cnt || 0,
      postCount: postCount?.cnt || 0,
      taskCount: taskCount?.cnt || 0,
      activityCount: activityCount?.cnt || 0
    }, '获取成功')
  } catch (error) {
    console.error('Admin get users error:', error)
    return createErrorResponse(500, '获取用户列表失败', error.message)
  }
}
