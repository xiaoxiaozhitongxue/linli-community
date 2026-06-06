import {
  createResponse,
  createErrorResponse,
  getDb,
  requireAuth
} from '../../lib/index.js'

export async function onRequestGet(context) {
  try {
    const authError = await requireAuth(context)
    if (authError) {
      return authError
    }

    const user = context.user
    const db = getDb(context)
    const url = new URL(context.request.url)
    const taskId = url.searchParams.get('task_id')
    const category = url.searchParams.get('category')
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 10, 20)

    let matches = []
    
    if (taskId) {
      const task = await db.get('SELECT * FROM tasks WHERE id = ?', [taskId])
      if (task) {
        matches = await findMatchesForTask(db, user, task, limit)
      }
    } else if (category) {
      matches = await findMatchesByCategory(db, user, category, limit)
    } else {
      matches = await findGeneralMatches(db, user, limit)
    }

    return createResponse({
      matches,
      total: matches.length
    }, '匹配成功')
  } catch (error) {
    console.error('AI Match error:', error)
    return createErrorResponse(500, '匹配失败', error.message)
  }
}

// 根据任务特征匹配用户
async function findMatchesForTask(db, currentUser, task, limit) {
  const users = await db.query(`
    SELECT 
      u.id,
      u.nickname,
      u.avatar,
      u.role,
      u.community,
      u.credit_score,
      u.is_verified,
      u.bio,
      COALESCE(completed_tasks.count, 0) as completed_tasks_count,
      COALESCE(cancelled_tasks.count, 0) as cancelled_tasks_count,
      CASE 
        WHEN u.community = ? THEN 1 
        ELSE 0 
      END as same_community,
      CASE 
        WHEN u.role = 'volunteer' THEN 2
        WHEN u.role = 'elderly' THEN 1
        ELSE 0
      END as role_priority
    FROM users u
    LEFT JOIN (
      SELECT helper_id, COUNT(*) as count
      FROM tasks
      WHERE status = 'completed' AND helper_id IS NOT NULL
      GROUP BY helper_id
    ) completed_tasks ON u.id = completed_tasks.helper_id
    LEFT JOIN (
      SELECT helper_id, COUNT(*) as count
      FROM tasks
      WHERE status = 'cancelled' AND helper_id IS NOT NULL
      GROUP BY helper_id
    ) cancelled_tasks ON u.id = cancelled_tasks.helper_id
    WHERE u.id != ?
    AND u.role IN ('resident', 'volunteer', 'elderly')
    AND u.id NOT IN (
      SELECT helper_id FROM tasks 
      WHERE status = 'in_progress' AND helper_id IS NOT NULL
      GROUP BY helper_id
      HAVING COUNT(*) >= 3
    )
    ORDER BY 
      same_community DESC,
      role_priority DESC,
      (COALESCE(completed_tasks.count, 0) - COALESCE(cancelled_tasks.count, 0)) DESC,
      u.credit_score DESC,
      u.is_verified DESC
    LIMIT ?
  `, [currentUser.community, currentUser.id, limit])

  return users.map(u => {
    const matchScore = calculateMatchScore(u, task, currentUser)
    return {
      id: u.id,
      name: u.nickname,
      avatar: u.avatar,
      role: u.role,
      community: u.community,
      bio: u.bio,
      rating: calculateRating(u.credit_score),
      distance: estimateDistance(u.community, currentUser.community),
      completedTasks: u.completed_tasks_count,
      cancelledTasks: u.cancelled_tasks_count,
      completionRate: calculateCompletionRate(u.completed_tasks_count, u.cancelled_tasks_count),
      isVerified: u.is_verified,
      isVolunteer: u.role === 'volunteer',
      sameCommunity: u.same_community === 1,
      tags: generateTags(u),
      matchScore,
      matchReasons: generateMatchReasons(u, task)
    }
  }).sort((a, b) => b.matchScore - a.matchScore)
}

// 根据类别匹配用户
async function findMatchesByCategory(db, currentUser, category, limit) {
  const categoryScores = {
    'shopping': { volunteer: 5, resident: 3, elderly: 1 },
    'delivery': { volunteer: 5, resident: 3, elderly: 1 },
    'help': { volunteer: 5, resident: 2, elderly: 3 },
    'companionship': { volunteer: 3, resident: 2, elderly: 5 },
    'other': { volunteer: 3, resident: 3, elderly: 3 }
  }

  const users = await db.query(`
    SELECT 
      u.id,
      u.nickname,
      u.avatar,
      u.role,
      u.community,
      u.credit_score,
      u.is_verified,
      u.bio,
      COALESCE(completed_tasks.count, 0) as completed_tasks_count,
      COALESCE(cancelled_tasks.count, 0) as cancelled_tasks_count,
      CASE 
        WHEN u.community = ? THEN 1 
        ELSE 0 
      END as same_community,
      CASE 
        WHEN u.role = 'volunteer' THEN ?
        WHEN u.role = 'elderly' THEN ?
        ELSE ?
      END as category_score
    FROM users u
    LEFT JOIN (
      SELECT helper_id, COUNT(*) as count
      FROM tasks
      WHERE status = 'completed' AND helper_id IS NOT NULL
      GROUP BY helper_id
    ) completed_tasks ON u.id = completed_tasks.helper_id
    LEFT JOIN (
      SELECT helper_id, COUNT(*) as count
      FROM tasks
      WHERE status = 'cancelled' AND helper_id IS NOT NULL
      GROUP BY helper_id
    ) cancelled_tasks ON u.id = cancelled_tasks.helper_id
    WHERE u.id != ?
    AND u.role IN ('resident', 'volunteer', 'elderly')
    ORDER BY 
      same_community DESC,
      category_score DESC,
      (COALESCE(completed_tasks.count, 0) - COALESCE(cancelled_tasks.count, 0)) DESC,
      u.credit_score DESC
    LIMIT ?
  `, [
    currentUser.community, 
    categoryScores[category]?.volunteer || 3,
    categoryScores[category]?.elderly || 3,
    categoryScores[category]?.resident || 3,
    currentUser.id, 
    limit
  ])

  return users.map(u => ({
    id: u.id,
    name: u.nickname,
    avatar: u.avatar,
    role: u.role,
    community: u.community,
    bio: u.bio,
    rating: calculateRating(u.credit_score),
    distance: estimateDistance(u.community, currentUser.community),
    completedTasks: u.completed_tasks_count,
    cancelledTasks: u.cancelled_tasks_count,
    completionRate: calculateCompletionRate(u.completed_tasks_count, u.cancelled_tasks_count),
    isVerified: u.is_verified,
    isVolunteer: u.role === 'volunteer',
    sameCommunity: u.same_community === 1,
    tags: generateTags(u),
    matchScore: u.category_score * 10 + (u.completed_tasks_count - u.cancelled_tasks_count) * 2 + (u.same_community ? 20 : 0)
  })).sort((a, b) => b.matchScore - a.matchScore)
}

// 通用匹配
async function findGeneralMatches(db, currentUser, limit) {
  const users = await db.query(`
    SELECT 
      u.id,
      u.nickname,
      u.avatar,
      u.role,
      u.community,
      u.credit_score,
      u.is_verified,
      u.bio,
      COALESCE(completed_tasks.count, 0) as completed_tasks_count,
      COALESCE(cancelled_tasks.count, 0) as cancelled_tasks_count,
      CASE 
        WHEN u.community = ? THEN 1 
        ELSE 0 
      END as same_community
    FROM users u
    LEFT JOIN (
      SELECT helper_id, COUNT(*) as count
      FROM tasks
      WHERE status = 'completed' AND helper_id IS NOT NULL
      GROUP BY helper_id
    ) completed_tasks ON u.id = completed_tasks.helper_id
    LEFT JOIN (
      SELECT helper_id, COUNT(*) as count
      FROM tasks
      WHERE status = 'cancelled' AND helper_id IS NOT NULL
      GROUP BY helper_id
    ) cancelled_tasks ON u.id = cancelled_tasks.helper_id
    WHERE u.id != ?
    AND u.role IN ('resident', 'volunteer', 'elderly')
    ORDER BY 
      same_community DESC,
      (COALESCE(completed_tasks.count, 0) - COALESCE(cancelled_tasks.count, 0)) DESC,
      u.credit_score DESC,
      u.is_verified DESC
    LIMIT ?
  `, [currentUser.community, currentUser.id, limit])

  return users.map(u => ({
    id: u.id,
    name: u.nickname,
    avatar: u.avatar,
    role: u.role,
    community: u.community,
    bio: u.bio,
    rating: calculateRating(u.credit_score),
    distance: estimateDistance(u.community, currentUser.community),
    completedTasks: u.completed_tasks_count,
    cancelledTasks: u.cancelled_tasks_count,
    completionRate: calculateCompletionRate(u.completed_tasks_count, u.cancelled_tasks_count),
    isVerified: u.is_verified,
    isVolunteer: u.role === 'volunteer',
    sameCommunity: u.same_community === 1,
    tags: generateTags(u),
    matchScore: 50 + (u.completed_tasks_count - u.cancelled_tasks_count) * 3 + (u.same_community ? 20 : 0) + (u.is_verified ? 10 : 0)
  })).sort((a, b) => b.matchScore - a.matchScore)
}

// 计算信用评分对应的星级
function calculateRating(creditScore) {
  if (!creditScore) return 3.5
  const base = Math.min(5, 3 + (creditScore - 100) / 50)
  return Math.max(3, Math.round(base * 10) / 10)
}

// 计算匹配分数
function calculateMatchScore(user, task, currentUser) {
  let score = 50 // 基础分

  // 认证用户加分
  if (user.is_verified) score += 15

  // 信用评分转换成分数
  score += Math.max(0, (user.credit_score - 80) * 0.3)

  // 完成率加分
  const completionRate = calculateCompletionRate(user.completed_tasks_count, user.cancelled_tasks_count)
  score += completionRate * 20

  // 志愿者额外加分
  if (user.role === 'volunteer') score += 15

  // 相同社区加分
  if (user.same_community) score += 20

  // 经验加分
  score += Math.min(15, user.completed_tasks_count * 2)

  // 随机因素（-5 到 +5）
  score += Math.floor(Math.random() * 11) - 5

  return Math.max(0, Math.round(score))
}

// 计算完成率
function calculateCompletionRate(completed, cancelled) {
  const total = completed + cancelled
  if (total === 0) return 0.8 // 默认80%完成率
  return Math.round((completed / total) * 100) / 100
}

// 估算距离（简化版，实际应该用真实地理位置）
function estimateDistance(community1, community2) {
  if (community1 === community2) {
    return Math.floor(Math.random() * 200) + 50 // 同社区 50-250米
  }
  return Math.floor(Math.random() * 2000) + 500 // 不同社区 500-2500米
}

// 生成标签
function generateTags(user) {
  const tags = []
  if (user.role === 'volunteer') tags.push('志愿者')
  if (user.is_verified) tags.push('已认证')
  if (user.credit_score >= 120) tags.push('信誉优秀')
  if (user.completed_tasks_count >= 10) tags.push('经验丰富')
  if (user.completed_tasks_count >= 5 && user.completed_tasks_count < 10) tags.push('帮助达人')
  if (tags.length === 0) tags.push('热心邻居')
  return tags
}

// 生成匹配原因
function generateMatchReasons(user, task) {
  const reasons = []
  
  if (user.same_community) {
    reasons.push('同社区，响应更快')
  }
  
  if (user.role === 'volunteer') {
    reasons.push('志愿者，服务热情')
  }
  
  if (user.completed_tasks_count > 5) {
    reasons.push(`已完成${user.completed_tasks_count}个任务`)
  }
  
  if (user.is_verified) {
    reasons.push('身份已认证')
  }
  
  if (user.credit_score >= 120) {
    reasons.push('信誉优秀')
  }
  
  return reasons.length > 0 ? reasons : ['适合帮助此任务']
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
