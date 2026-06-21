import {
  createPaginatedResponse,
  createErrorResponse,
  getDb,
  getQueryParams,
  requireAuth
} from '../../lib/index.js'

export async function onRequestGet(context) {
  try {
    const { request } = context
    const params = getQueryParams(request)

    const onlineOnly = params.online === '1' || params.online === 'true'
    const page = parseInt(params.page) || 1
    const limit = Math.min(parseInt(params.limit) || 20, 100)
    const community = params.community
    const role = params.role
    const search = params.search

    const offset = (page - 1) * limit

    let whereClauses = []
    let whereParams = []

    if (onlineOnly) {
      // 15分钟内活跃
      const fifteenMinutesAgo = Math.floor(Date.now() / 1000) - 15 * 60
      whereClauses.push('last_active_at >= ?')
      whereParams.push(fifteenMinutesAgo)
    }

    if (community) {
      whereClauses.push('community = ?')
      whereParams.push(community)
    }

    if (role && ['resident', 'elderly', 'volunteer', 'merchant'].includes(role)) {
      whereClauses.push('role = ?')
      whereParams.push(role)
    }

    if (search) {
      whereClauses.push('(nickname LIKE ? OR phone LIKE ?)')
      whereParams.push(`%${search}%`, `%${search}%`)
    }

    const whereClause = whereClauses.length > 0
      ? 'WHERE ' + whereClauses.join(' AND ')
      : ''

    const db = getDb(context)

    const countSql = `SELECT COUNT(*) as total FROM users ${whereClause}`
    const countResult = await db.get(countSql, whereParams)
    const total = countResult.total || 0

    const orderBy = onlineOnly ? 'last_active_at DESC' : 'created_at DESC'

    const sql = `
      SELECT id, phone, nickname, avatar, gender, birthday,
             community, address, bio, role, credit_score, is_verified,
             created_at, last_active_at
      FROM users
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `
    const users = await db.query(sql, [...whereParams, limit, offset])

    const safeUsers = users.map(user => ({
      id: user.id,
      phone: user.phone,
      nickname: user.nickname,
      avatar: user.avatar,
      gender: user.gender,
      birthday: user.birthday,
      community: user.community,
      address: user.address,
      bio: user.bio,
      role: user.role,
      credit_score: user.credit_score,
      is_verified: user.is_verified === 1,
      created_at: user.created_at,
      last_active_at: user.last_active_at
    }))

    return createPaginatedResponse(safeUsers, page, limit, total, '获取用户列表成功')
  } catch (error) {
    console.error('Get users error:', error)
    return createErrorResponse(500, '获取用户列表失败', error.message)
  }
}

export function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}
