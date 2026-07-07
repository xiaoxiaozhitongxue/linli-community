import { request, unwrap, get, ResponseData } from './request'

// 构造一个 fetch 的假 Response（request.ts 仅使用 ok / status / json()）
function makeResponse(body: any, init: { ok?: boolean; status?: number } = {}) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  }
}

describe('request - 统一请求封装', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    localStorage.clear()
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('成功时 resolve 完整的 ResponseData（含 success/message/data，而非仅解包 data）', async () => {
    const payload: ResponseData = {
      success: true,
      message: 'ok',
      data: { id: 1, title: '任务A' },
      timestamp: 123456,
    }
    fetchMock.mockResolvedValue(makeResponse(payload, { ok: true, status: 200 }))

    const res = await request({ url: '/api/success-1', showLoading: false, showError: false })
    expect(res.success).toBe(true)
    expect(res.message).toBe('ok')
    expect(res.data).toEqual({ id: 1, title: '任务A' })
    expect(res.timestamp).toBe(123456)
  })

  it('成功响应里的完整外层字段对 service 层可见', async () => {
    const payload = { success: true, message: 'done', data: [1, 2, 3] }
    fetchMock.mockResolvedValue(makeResponse(payload))
    const res = await request({ url: '/api/success-2', showLoading: false, showError: false })
    expect(res).toMatchObject(payload)
  })

  it('业务失败（200 但 success:false）reject，error.message 为后端 message，并挂 .response/.status', async () => {
    const payload: ResponseData = {
      success: false,
      message: '参数错误',
      data: null,
      error: { code: 400, message: '参数错误' },
    }
    fetchMock.mockResolvedValue(makeResponse(payload, { ok: true, status: 200 }))

    let caught: any
    try {
      await request({ url: '/api/fail-1', showLoading: false, showError: false })
    } catch (e) {
      caught = e
    }
    expect(caught).toBeInstanceOf(Error)
    expect(caught.message).toBe('参数错误')
    expect(caught.response).toEqual(payload)
    expect(caught.status).toBe(400)
  })

  it('业务失败优先使用 error.message，缺失时回退到 message', async () => {
    const payload = { success: false, message: '请求失败' }
    fetchMock.mockResolvedValue(makeResponse(payload))
    await expect(
      request({ url: '/api/fail-2', showLoading: false, showError: false }),
    ).rejects.toThrow('请求失败')
  })

  it('【关键】401 时仅 reject，不清除 localStorage 的 token/userInfo、不跳转登录页', async () => {
    // 预置登录态
    localStorage.setItem('token', 'secret-token')
    localStorage.setItem('userInfo', JSON.stringify({ id: 1, name: '张三' }))

    const payload: ResponseData = {
      success: false,
      message: '登录已过期',
      data: null,
      error: { code: 401, message: '登录已过期' },
    }
    fetchMock.mockResolvedValue(makeResponse(payload, { ok: true, status: 200 }))

    const removeSpy = vi.spyOn(Storage.prototype, 'removeItem')

    let caught: any
    try {
      await request({ url: '/api/auth-401', showLoading: false, showError: false })
    } catch (e) {
      caught = e
    }
    expect(caught).toBeInstanceOf(Error)
    expect(caught.message).toBe('登录已过期')
    expect(caught.status).toBe(401)
    expect(caught.response).toEqual(payload)

    // 登录态未被清除（B2 修复项）
    expect(localStorage.getItem('token')).toBe('secret-token')
    expect(localStorage.getItem('userInfo')).toBe(JSON.stringify({ id: 1, name: '张三' }))
    // 未触发任何 removeItem（无清除登录态副作用、无自动跳转）
    expect(removeSpy).not.toHaveBeenCalled()
  })

  it('401 且提供 on401 时调用自定义回调而非自动跳转', async () => {
    const payload: ResponseData = {
      success: false,
      message: 'exp',
      data: null,
      error: { code: 401, message: 'exp' },
    }
    fetchMock.mockResolvedValue(makeResponse(payload))
    const on401 = vi.fn()

    let caught: any
    try {
      await request({ url: '/api/on401', on401, showLoading: false, showError: false })
    } catch (e) {
      caught = e
    }
    expect(on401).toHaveBeenCalledTimes(1)
    expect(on401).toHaveBeenCalledWith(payload)
    expect(caught).toBeInstanceOf(Error)
  })

  it('HTTP 5xx 时 reject 服务器错误', async () => {
    fetchMock.mockResolvedValue(makeResponse({}, { ok: false, status: 500 }))
    await expect(
      request({ url: '/api/server-500', showLoading: false, showError: false }),
    ).rejects.toThrow('HTTP 500: 服务器错误')
  })

  it('响应体非 JSON 时 reject 格式错误', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError('Unexpected token')
      },
    })
    await expect(
      request({ url: '/api/bad-json', showLoading: false, showError: false }),
    ).rejects.toThrow('服务器响应格式错误')
  })

  it('unwrap 解包 data 字段', () => {
    const res: ResponseData<number> = { success: true, message: 'ok', data: 42 }
    expect(unwrap(res)).toBe(42)
  })

  it('get() 便捷方法同样 resolve 完整响应', async () => {
    const payload = { success: true, message: 'ok', data: { list: [] } }
    fetchMock.mockResolvedValue(makeResponse(payload))
    const res = await get('/api/items', undefined, { showLoading: false, showError: false })
    expect(res.data).toEqual({ list: [] })
  })
})
