import { localStore } from './localStore'

describe('localStore - 类型化 CRUD（jsdom 环境）', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('数组读写', () => {
    it('setArray 后 getArray 能回读并保持顺序', () => {
      const list = [{ id: '1', name: 'a' }, { id: '2', name: 'b' }]
      localStore.setArray('tasks', list)
      expect(localStore.getArray('tasks')).toEqual(list)
    })

    it('getArray 在 key 不存在时返回默认空数组', () => {
      expect(localStore.getArray('nope')).toEqual([])
      expect(localStore.getArray('nope', [{ id: 'x' }])).toEqual([{ id: 'x' }])
    })

    it('getArray 遇到损坏 JSON 不抛错，返回默认值', () => {
      localStorage.setItem(localStore.buildKey('bad'), '{ this is not json')
      expect(() => localStore.getArray('bad')).not.toThrow()
      expect(localStore.getArray('bad')).toEqual([])
    })

    it('getArray 遇到非数组 JSON 返回默认值', () => {
      localStorage.setItem(localStore.buildKey('obj'), JSON.stringify({ foo: 1 }))
      expect(localStore.getArray('obj')).toEqual([])
    })
  })

  describe('对象读写', () => {
    it('setObject 后 getObject 能回读', () => {
      const obj = { theme: 'dark', lang: 'zh' }
      localStore.setObject('pref', obj)
      expect(localStore.getObject('pref', { theme: 'light', lang: 'en' })).toEqual(obj)
    })

    it('getObject 不存在时返回默认值', () => {
      expect(localStore.getObject('pref', { theme: 'light' })).toEqual({ theme: 'light' })
    })

    it('getObject 与默认值浅合并（已存储覆盖默认，缺失保留默认）', () => {
      localStore.setObject('pref', { theme: 'dark' })
      expect(localStore.getObject('pref', { theme: 'light', lang: 'en' })).toEqual({
        theme: 'dark',
        lang: 'en',
      })
    })

    it('getObject 遇到损坏 JSON 返回默认值且不抛错', () => {
      localStorage.setItem(localStore.buildKey('broken'), 'not json')
      expect(() => localStore.getObject('broken', { a: 1 })).not.toThrow()
      expect(localStore.getObject('broken', { a: 1 })).toEqual({ a: 1 })
    })
  })

  describe('字符串读写', () => {
    it('setString / getString 读写原始字符串', () => {
      localStore.setString('token_str', 'abc')
      expect(localStore.getString('token_str')).toBe('abc')
    })
    it('getString 不存在返回默认', () => {
      expect(localStore.getString('missing')).toBe('')
      expect(localStore.getString('missing', 'def')).toBe('def')
    })
  })

  describe('存在性 / 删除', () => {
    it('has 正确反映 key 是否存在', () => {
      expect(localStore.has('x')).toBe(false)
      localStore.setString('x', '1')
      expect(localStore.has('x')).toBe(true)
    })
    it('remove 删除指定 key', () => {
      localStore.setString('x', '1')
      localStore.remove('x')
      expect(localStore.has('x')).toBe(false)
    })
  })

  describe('upsert / removeById / append', () => {
    it('upsert 新增项置于队首', () => {
      localStore.setArray('items', [{ id: '1', v: 1 }])
      const res = localStore.upsert('items', { id: '2', v: 2 })
      expect(res).toHaveLength(2)
      expect(res[0]).toEqual({ id: '2', v: 2 })
    })
    it('upsert 已存在项则就地替换（不新增）', () => {
      localStore.setArray('items', [{ id: '1', v: 1 }])
      const res = localStore.upsert('items', { id: '1', v: 99 })
      expect(res).toHaveLength(1)
      expect(res[0]).toEqual({ id: '1', v: 99 })
    })
    it('removeById 移除匹配 id 的项并返回剩余列表', () => {
      localStore.setArray('items', [{ id: '1' }, { id: '2' }])
      const res = localStore.removeById('items', '1')
      expect(res).toEqual([{ id: '2' }])
      expect(localStore.getArray('items')).toEqual([{ id: '2' }])
    })
    it('append 将记录置于队首并保持顺序', () => {
      localStore.append('log', { n: 1 })
      localStore.append('log', { n: 2 })
      expect(localStore.getArray('log')).toEqual([{ n: 2 }, { n: 1 }])
    })
  })

  describe('buildKey 与 linli_ 前缀', () => {
    it('自动添加 linli_ 前缀', () => {
      expect(localStore.buildKey('tasks')).toBe('linli_tasks')
    })
    it('已带 linli_ 前缀时不重复添加', () => {
      expect(localStore.buildKey('linli_tasks')).toBe('linli_tasks')
    })
    it('带 scope 时拼接 _scope', () => {
      expect(localStore.buildKey('tasks', 'userA')).toBe('linli_tasks_userA')
    })
  })

  describe('用户维度隔离', () => {
    it('不同 scope 的数据互不串读', () => {
      localStore.setArray('tasks', [{ id: '1' }], 'userA')
      expect(localStore.getArray('tasks', [], 'userB')).toEqual([])
      localStore.setArray('tasks', [{ id: '2' }], 'userB')
      expect(localStore.getArray('tasks', [], 'userA')).toEqual([{ id: '1' }])
      expect(localStore.getArray('tasks', [], 'userB')).toEqual([{ id: '2' }])
    })
    it('带 scope 与不带 scope 存储相互独立', () => {
      localStore.setString('name', 'global')
      localStore.setString('name', 'scoped', 'userA')
      expect(localStore.getString('name')).toBe('global')
      expect(localStore.getString('name', '', 'userA')).toBe('scoped')
    })
  })
})
