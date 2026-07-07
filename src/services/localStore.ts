/**
 * 本地数据持久化服务（基于 localStorage 的类型化 CRUD）
 * ----------------------------------------------------------------------------
 * 用于「暂无后端模块」的页面，使其具备真实的读写能力，告别硬编码 / mock 假数据。
 *
 * 设计要点：
 *  1. 所有 key 自动加 `linli_` 前缀，避免与其它 localStorage 数据冲突；
 *  2. 支持「按用户维度隔离」（scope = 手机号/用户ID），与历史 getUserStorageKey 行为一致；
 *  3. JSON 解析失败 / 配额超限均被静默兜底，不抛出，保证页面不白屏；
 *  4. 提供通用 CRUD（upsert / removeById / append）供列表型数据复用。
 */

const PREFIX = 'linli_'

/** 拼装最终存储 key；scope 用于按用户隔离（如手机号） */
function buildKey(key: string, scope?: string): string {
  const base = key.startsWith(PREFIX) ? key : `${PREFIX}${key}`
  return scope ? `${base}_${scope}` : base
}

export const localStore = {
  /** 读取 JSON 数组；不存在或解析失败返回 defaultVal */
  getArray<T>(key: string, defaultVal: T[] = [], scope?: string): T[] {
    try {
      const raw = localStorage.getItem(buildKey(key, scope))
      if (!raw) return defaultVal
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? (parsed as T[]) : defaultVal
    } catch {
      return defaultVal
    }
  },

  /** 写入 JSON 数组 */
  setArray<T>(key: string, value: T[], scope?: string): void {
    try {
      localStorage.setItem(buildKey(key, scope), JSON.stringify(value))
    } catch {
      /* 忽略：隐私模式 / 配额超限 */
    }
  },

  /** 读取 JSON 对象，并与默认值浅合并 */
  getObject<T extends Record<string, any>>(key: string, defaultVal: T, scope?: string): T {
    try {
      const raw = localStorage.getItem(buildKey(key, scope))
      if (!raw) return defaultVal
      const parsed = JSON.parse(raw)
      return { ...defaultVal, ...(parsed as Partial<T>) }
    } catch {
      return defaultVal
    }
  },

  /** 写入 JSON 对象 */
  setObject<T extends Record<string, any>>(key: string, value: T, scope?: string): void {
    try {
      localStorage.setItem(buildKey(key, scope), JSON.stringify(value))
    } catch {
      /* 忽略 */
    }
  },

  /** 读取原始字符串 */
  getString(key: string, defaultVal = '', scope?: string): string {
    try {
      return localStorage.getItem(buildKey(key, scope)) ?? defaultVal
    } catch {
      return defaultVal
    }
  },

  /** 写入原始字符串 */
  setString(key: string, value: string, scope?: string): void {
    try {
      localStorage.setItem(buildKey(key, scope), value)
    } catch {
      /* 忽略 */
    }
  },

  /** 删除指定 key */
  remove(key: string, scope?: string): void {
    try {
      localStorage.removeItem(buildKey(key, scope))
    } catch {
      /* 忽略 */
    }
  },

  /** 判断 key 是否存在 */
  has(key: string, scope?: string): boolean {
    try {
      return localStorage.getItem(buildKey(key, scope)) !== null
    } catch {
      return false
    }
  },

  /**
   * 通用 upsert：按 id 字段新增或更新列表中的一项（存在则替换，否则置于队首）。
   * 返回更新后的完整列表。
   */
  upsert<T extends { id: string | number }>(key: string, item: T, scope?: string): T[] {
    const list = localStore.getArray<T>(key, [], scope)
    const idx = list.findIndex((it) => it.id === item.id)
    if (idx >= 0) {
      list[idx] = item
    } else {
      list.unshift(item)
    }
    localStore.setArray(key, list, scope)
    return list
  },

  /** 按 id 从列表中移除一项，返回剩余列表 */
  removeById<T extends { id: string | number }>(key: string, id: string | number, scope?: string): T[] {
    const list = localStore.getArray<T>(key, [], scope).filter((it) => it.id !== id)
    localStore.setArray(key, list, scope)
    return list
  },

  /** 追加一条记录（如事件流水），置于队首，返回新列表 */
  append<T>(key: string, item: T, scope?: string): T[] {
    const list = localStore.getArray<T>(key, [], scope)
    list.unshift(item)
    localStore.setArray(key, list, scope)
    return list
  },

  /** 暴露 key 拼装函数（与历史 getUserStorageKey 行为对接） */
  buildKey,
}

export default localStore
