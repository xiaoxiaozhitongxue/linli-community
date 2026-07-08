// ============================================================================
// 全局搜索接口：GET /api/search?q=关键词
// 跨「帖子 / 互助任务 / 社区活动」三类内容做搜索匹配并聚合返回。
// 优先使用 D1 FTS5 全文搜索（posts_fts 虚拟表），若 FTS 不可用则回退 LIKE。
// 前端 search/index.vue 统一调用本接口。
// ============================================================================
import { getDb } from '../lib/db.js'
import { createResponse, createErrorResponse } from '../lib/response.js'
import { getQueryParams } from '../lib/utils.js'

/** 初始化 FTS5 虚拟表 & 同步触发器（仅首次执行） */
async function ensureFtsTables(db) {
  try {
    // 创建 FTS5 虚拟表（帖子全文搜索）
    await db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS posts_fts USING fts5(
        content,
        location,
        tokenize='unicode61'
      );
    `)

    // 创建已有数据的同步（避免触发器未覆盖已存在行）
    const ftsCount = await db.get('SELECT COUNT(*) as cnt FROM posts_fts')
    if (ftsCount && ftsCount.cnt === 0) {
      await db.exec(`
        INSERT INTO posts_fts(rowid, content, location)
        SELECT rowid, content, location FROM posts WHERE visibility = 'public';
      `)
    }

    // INSERT 触发器
    await db.exec(`
      CREATE TRIGGER IF NOT EXISTS posts_fts_insert AFTER INSERT ON posts
      WHEN NEW.visibility = 'public'
      BEGIN
        INSERT INTO posts_fts(rowid, content, location)
        VALUES (NEW.rowid, NEW.content, NEW.location);
      END;
    `)

    // UPDATE 触发器
    await db.exec(`
      CREATE TRIGGER IF NOT EXISTS posts_fts_update AFTER UPDATE ON posts
      WHEN NEW.visibility = 'public'
      BEGIN
        INSERT INTO posts_fts(posts_fts, rowid, content, location)
        VALUES ('delete', OLD.rowid, OLD.content, OLD.location);
        INSERT INTO posts_fts(rowid, content, location)
        VALUES (NEW.rowid, NEW.content, NEW.location);
      END;
    `)

    // DELETE 触发器
    await db.exec(`
      CREATE TRIGGER IF NOT EXISTS posts_fts_delete AFTER DELETE ON posts
      BEGIN
        INSERT INTO posts_fts(posts_fts, rowid, content, location)
        VALUES ('delete', OLD.rowid, OLD.content, OLD.location);
      END;
    `)
  } catch (err) {
    // FTS5 可能不被 Cloudflare D1 支持 — 静默失败，后续回退 LIKE
    console.warn('[search] FTS5 init skipped (not supported):', err.message)
  }
}

/** 将正文裁剪为纯文本摘要 */
function snippet(text) {
  if (!text) return ''
  const plain = String(text)
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return plain.length > 50 ? plain.slice(0, 50) + '…' : plain
}

function normalizePost(p) {
  return {
    id: p.id,
    type: 'post',
    title: p.content ? p.content.slice(0, 30) : '',
    content: p.content,
    snippet: snippet(p.content),
    location: p.location,
    author: p.author,
    author_avatar: p.author_avatar,
    like_count: p.like_count || 0,
    comment_count: p.comment_count || 0,
    created_at: p.created_at
  }
}

function normalizeTask(t) {
  return {
    id: t.id,
    type: 'task',
    title: t.title,
    content: t.description,
    snippet: snippet(t.description),
    category: t.category,
    status: t.status,
    reward: t.reward,
    author: t.author,
    created_at: t.created_at
  }
}

function normalizeActivity(a) {
  return {
    id: a.id,
    type: 'activity',
    title: a.title,
    content: a.description,
    snippet: snippet(a.description),
    category: a.category,
    status: a.status,
    location: a.location,
    start_time: a.start_time,
    author: a.author,
    created_at: a.created_at
  }
}

export async function onRequestGet(context) {
  try {
    const db = getDb(context)
    const params = getQueryParams(context.request)
    const q = (params.q || '').trim()
    const limit = Math.min(parseInt(params.limit || '20') || 20, 50)

    if (!q) {
      return createResponse(
        { query: '', posts: [], tasks: [], activities: [], total: 0 },
        '请输入搜索关键词'
      )
    }

    const like = `%${q}%`

    // 尝试 FTS5 全文搜索（仅帖子），失败则回退 LIKE
    let posts = []
    let ftsUsed = false
    try {
      // 先确保 FTS 表存在
      await ensureFtsTables(db)

      // 使用 FTS5 搜索（BM25 排序）
      const ftsResult = await db.query(
        `SELECT p.id, p.content, p.location, p.created_at, p.like_count, p.comment_count,
                u.nickname AS author, u.avatar AS author_avatar
         FROM posts_fts f
         JOIN posts p ON p.rowid = f.rowid
         LEFT JOIN users u ON u.id = p.user_id
         WHERE posts_fts MATCH ?
         ORDER BY rank
         LIMIT ?`,
        [q, limit]
      )
      if (ftsResult && ftsResult.length > 0) {
        posts = ftsResult.map(normalizePost)
        ftsUsed = true
      }
    } catch (ftsError) {
      // FTS 不可用，静默回退
      console.warn('[search] FTS5 query failed, falling back to LIKE:', ftsError.message)
    }

    if (!ftsUsed || posts.length === 0) {
      // 帖子：正文模糊匹配（仅公开内容）
      posts = (await db.query(
        `SELECT p.id, p.content, p.location, p.created_at, p.like_count, p.comment_count,
                u.nickname AS author, u.avatar AS author_avatar
         FROM posts p
         LEFT JOIN users u ON u.id = p.user_id
         WHERE p.visibility = 'public' AND p.content LIKE ?
         ORDER BY p.created_at DESC
         LIMIT ?`,
        [like, limit]
      )).map(normalizePost)
    }

    // 互助任务：标题 / 描述模糊匹配（始终 LIKE，任务表内容较少）
    const tasks = (await db.query(
      `SELECT t.id, t.title, t.description, t.category, t.status, t.reward, t.created_at,
              u.nickname AS author
       FROM tasks t
       LEFT JOIN users u ON u.id = t.user_id
       WHERE t.title LIKE ? OR t.description LIKE ?
       ORDER BY t.created_at DESC
       LIMIT ?`,
      [like, like, limit]
    )).map(normalizeTask)

    // 社区活动：标题 / 描述模糊匹配
    const activities = (await db.query(
      `SELECT a.id, a.title, a.description, a.category, a.status, a.location, a.start_time, a.created_at,
              u.nickname AS author
       FROM activities a
       LEFT JOIN users u ON u.id = a.user_id
       WHERE a.title LIKE ? OR a.description LIKE ?
       ORDER BY a.created_at DESC
       LIMIT ?`,
      [like, like, limit]
    )).map(normalizeActivity)

    // 如果 FTS 返回为空但 LIKE 有结果，用 LIKE 结果补充（确保不漏）
    if (ftsUsed && posts.length === 0) {
      posts = (await db.query(
        `SELECT p.id, p.content, p.location, p.created_at, p.like_count, p.comment_count,
                u.nickname AS author, u.avatar AS author_avatar
         FROM posts p
         LEFT JOIN users u ON u.id = p.user_id
         WHERE p.visibility = 'public' AND p.content LIKE ?
         ORDER BY p.created_at DESC
         LIMIT ?`,
        [like, limit]
      )).map(normalizePost)
    }

    const total = posts.length + tasks.length + activities.length

    return createResponse(
      {
        query: q,
        posts,
        tasks,
        activities,
        total
      },
      total > 0 ? '搜索成功' : '未找到匹配结果'
    )
  } catch (error) {
    console.error('Search error:', error)
    return createErrorResponse(500, '搜索失败', error.message)
  }
}
