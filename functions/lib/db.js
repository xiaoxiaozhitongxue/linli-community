export class Database {
  constructor(db) {
    this.db = db
  }

  async query(sql, params = []) {
    try {
      const stmt = this.db.prepare(sql)
      const safeParams = params.map(v => (v === undefined ? null : v))
      let result
      if (safeParams.length > 0) {
        result = await stmt.bind(...safeParams).all()
      } else {
        result = await stmt.all()
      }
      return result.results || result
    } catch (error) {
      console.error('Database query error:', error)
      throw new Error(`数据库查询失败: ${error.message}`)
    }
  }

  async get(sql, params = []) {
    try {
      const stmt = this.db.prepare(sql)
      const safeParams = params.map(v => (v === undefined ? null : v))
      if (safeParams.length > 0) {
        return await stmt.bind(...safeParams).first()
      }
      return await stmt.first()
    } catch (error) {
      console.error('Database get error:', error)
      throw new Error(`数据库查询失败: ${error.message}`)
    }
  }

  async run(sql, params = []) {
    try {
      const stmt = this.db.prepare(sql)
      const safeParams = params.map(v => (v === undefined ? null : v))
      if (safeParams.length > 0) {
        return await stmt.bind(...safeParams).run()
      }
      return await stmt.run()
    } catch (error) {
      console.error('Database run error:', error)
      throw new Error(`数据库操作失败: ${error.message}`)
    }
  }

  async batch(queries) {
    try {
      const stmts = queries.map(q => {
        const stmt = this.db.prepare(q.sql)
        return q.params ? stmt.bind(...q.params) : stmt
      })
      return await this.db.batch(stmts)
    } catch (error) {
      console.error('Database batch error:', error)
      throw new Error(`批量操作失败: ${error.message}`)
    }
  }

  async insert(table, data) {
    const keys = Object.keys(data)
    const values = Object.values(data).map(v => (v === undefined ? null : v))
    const placeholders = keys.map(() => '?').join(', ')
    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`
    return await this.run(sql, values)
  }

  async update(table, data, where, whereParams = []) {
    const setClauses = Object.keys(data).map(key => `${key} = ?`).join(', ')
    const sql = `UPDATE ${table} SET ${setClauses} WHERE ${where}`
    return await this.run(sql, [...Object.values(data).map(v => (v === undefined ? null : v)), ...whereParams])
  }

  async delete(table, where, params = []) {
    const sql = `DELETE FROM ${table} WHERE ${where}`
    return await this.run(sql, params)
  }
}

export function getDb(context) {
  if (!context.env.DB) {
    throw new Error('数据库绑定未配置')
  }
  return new Database(context.env.DB)
}
