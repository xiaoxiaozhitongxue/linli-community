import { getDb } from '../../lib/db.js'
import { createResponse, createErrorResponse, createPaginatedResponse } from '../../lib/response.js'
import { generateId, now, validateRequired, parseJsonBody, getQueryParams } from '../../lib/utils.js'
import { requireAuth } from '../../lib/auth.js'

async function getPostsWithUserInfo(db, posts, userId) {
  if (posts.length === 0) {
    return []
  }

  const userIds = [...new Set(posts.map(p => p.user_id))]
  let users = []
  if (userIds.length > 0) {
    users = await db.query(
      `SELECT id, nickname, avatar, community FROM users WHERE id IN (${userIds.map(() => '?').join(', ')})`,
      userIds
    )
  }
  const userMap = {}
  for (const user of users) {
    userMap[user.id] = user
  }

  let likedMap = {}
  if (userId && posts.length > 0) {
    const postIds = posts.map(p => p.id)
    const likes = await db.query(
      `SELECT target_id FROM likes WHERE user_id = ? AND target_type = 'post' AND target_id IN (${postIds.map(() => '?').join(', ')})`,
      [userId, ...postIds]
    )
    for (const like of likes) {
      likedMap[like.target_id] = true
    }
  }

  return posts.map(post => ({
    ...post,
    user: userMap[post.user_id] || null,
    is_liked: !!likedMap[post.id],
    images: post.images ? JSON.parse(post.images) : []
  }))
}

export async function onRequestGet(context) {
  try {
    const db = getDb(context)
    const params = getQueryParams(context.request)
    const page = parseInt(params.page || '1')
    const limit = parseInt(params.limit || '10')
    const sort = params.sort || 'created_at'
    const order = params.order || 'desc'
    const visibility = params.visibility || 'public'

    const offset = (page - 1) * limit

    let orderByClause = 'p.created_at DESC'
    if (sort === 'like_count') {
      orderByClause = `p.like_count ${order.toUpperCase()}, p.created_at DESC`
    } else if (sort === 'comment_count') {
      orderByClause = `p.comment_count ${order.toUpperCase()}, p.created_at DESC`
    } else if (sort === 'created_at') {
      orderByClause = `p.created_at ${order.toUpperCase()}`
    }

    let whereClause = 'p.visibility = ?'
    const whereParams = [visibility]

    const posts = await db.query(
      `SELECT p.* FROM posts p WHERE ${whereClause} ORDER BY ${orderByClause} LIMIT ? OFFSET ?`,
      [...whereParams, limit, offset]
    )

    const countResult = await db.get(
      `SELECT COUNT(*) as total FROM posts p WHERE ${whereClause}`,
      whereParams
    )

    let userId = null
    const authError = await requireAuth(context)
    if (!authError) {
      userId = context.user.id
    }

    const postsWithUsers = await getPostsWithUserInfo(db, posts, userId)

    return createPaginatedResponse(
      postsWithUsers,
      page,
      limit,
      countResult.total
    )
  } catch (error) {
    console.error('Get posts error:', error)
    return createErrorResponse(500, '获取动态失败', error.message)
  }
}

export async function onRequestPost(context) {
  try {
    // 鉴权（与全站约定一致：直接解析 token 并设置 context.user）
    const authError = await requireAuth(context)
    if (authError) {
      return authError
    }

    const db = getDb(context)
    const body = await parseJsonBody(context.request)

    const missing = validateRequired(body, ['content'])
    if (missing.length > 0) {
      return createErrorResponse(400, '缺少必填字段', { missing })
    }

    const { content, images, location, visibility } = body

    const postId = generateId()
    const timestamp = now()

    await db.insert('posts', {
      id: postId,
      user_id: context.user.id,
      content,
      images: images ? JSON.stringify(images) : null,
      location: location || null,
      visibility: visibility || 'public',
      created_at: timestamp,
      updated_at: timestamp
    })

    const post = await db.get('SELECT * FROM posts WHERE id = ?', [postId])
    const postsWithUsers = await getPostsWithUserInfo(db, [post], context.user.id)

    return createResponse(postsWithUsers[0], '动态创建成功', 201)
  } catch (error) {
    console.error('Create post error:', error)
    return createErrorResponse(500, '创建动态失败', error.message)
  }
}
