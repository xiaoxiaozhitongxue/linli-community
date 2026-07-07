import { toastError } from './toast'
import { showLoading as uiShowLoading, hideLoading as uiHideLoading } from './ui'

const BASE_URL = ''

export interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: any
  showLoading?: boolean
  showError?: boolean
  timeout?: number
  /**
   * B2: 可选自定义 401 行为。
   * 当后端返回 401 时，默认不再清除登录态、也不再自动跳转登录页，
   * 仅 reject 错误；若提供 on401，则交由调用方自行处理（如弹出登录引导）。
   */
  on401?: (response: ResponseData<any>) => void
}

export interface ResponseData<T = any> {
  success: boolean
  message: string
  data: T
  timestamp?: number
  error?: {
    code: number
    message: string
    details?: any
  }
}

const pendingRequests = new Map<string, Promise<any>>()

function getRequestKey(url: string, method: string, data?: any): string {
  return `${method}:${url}:${JSON.stringify(data || {})}`
}

function getToken(): string {
  try {
    return localStorage.getItem('token') || ''
  } catch (e) {
    return ''
  }
}

function showError(message: string) {
  toastError(message)
}

function buildQueryString(params: any): string {
  if (!params) return ''
  const query = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')
  return query ? `?${query}` : ''
}

/**
 * 统一请求封装。
 * - 成功：resolve 完整响应对象 { success, message, data, ... }（B8：service 可访问外层字段）
 * - 业务失败（success:false）：reject(new Error(message))，并在错误对象上挂载 response/status
 * - 401：仅 reject，不清除登录态、不自动跳转（B2）
 */
export function request<T = any>(config: RequestConfig): Promise<ResponseData<T>> {
  const {
    url,
    method = 'GET',
    data,
    header = {},
    showLoading: needLoading = true,
    showError: needError = true,
    timeout = 15000
  } = config

  const dedupKey = getRequestKey(url, method, data)

  if (pendingRequests.has(dedupKey)) {
    return pendingRequests.get(dedupKey)!
  }

  const abortController = new AbortController()

  const promise: Promise<ResponseData<T>> = new Promise((resolve, reject) => {
    if (needLoading) {
      uiShowLoading()
    }

    let requestUrl = BASE_URL + url
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': getToken() ? `Bearer ${getToken()}` : '',
      ...header
    }

    const requestInit: RequestInit = {
      method,
      headers: requestHeaders,
      signal: abortController.signal
    }

    if (method === 'GET' && data) {
      requestUrl += buildQueryString(data)
    } else if (data) {
      requestInit.body = JSON.stringify(data)
    }

    const timeoutId = setTimeout(() => {
      abortController.abort()
      if (needError) {
        showError('请求超时，请稍后重试')
      }
      reject(new Error('请求超时'))
    }, timeout)

    fetch(requestUrl, requestInit)
      .then(async (res) => {
        clearTimeout(timeoutId)
        if (needLoading) {
          uiHideLoading()
        }

        if (!res.ok && res.status >= 500) {
          if (needError) {
            showError('服务器繁忙，请稍后重试')
          }
          reject(new Error(`HTTP ${res.status}: 服务器错误`))
          return
        }

        let response: ResponseData<T>
        try {
          response = await res.json()
        } catch (parseError) {
          if (needError) {
            showError('服务器响应异常，请稍后重试')
          }
          reject(new Error('服务器响应格式错误'))
          return
        }

        if (response.success) {
          // B8: 返回完整响应对象，由 service 层解包 data
          resolve(response)
        } else {
          const errorMessage =
            response.error?.message ||
            response.message ||
            '请求失败，请稍后重试'

          if (needError) {
            showError(errorMessage)
          }

          // B2: 401 不再清除登录态 / 自动跳转，交由调用方处理
          if (response.error?.code === 401) {
            if (typeof config.on401 === 'function') {
              config.on401(response)
            }
          }

          const err: any = new Error(errorMessage)
          err.response = response
          err.status = response.error?.code
          reject(err)
        }
      })
      .catch((err) => {
        clearTimeout(timeoutId)
        if (needLoading) {
          uiHideLoading()
        }

        if (err.name === 'AbortError') {
          return
        }

        if (needError) {
          showError('网络连接失败，请检查网络设置')
        }

        reject(err)
      })
      .finally(() => {
        pendingRequests.delete(dedupKey)
      })
  })

  pendingRequests.set(dedupKey, promise)
  ;(promise as any).cancel = () => {
    abortController.abort()
    pendingRequests.delete(dedupKey)
  }

  return promise
}

/** 解包响应 data 字段（service 层统一使用） */
export function unwrap<T>(response: ResponseData<T>): T {
  return response.data
}

export function get<T = any>(url: string, data?: any, config?: Partial<RequestConfig>) {
  return request<T>({
    url,
    method: 'GET',
    data,
    ...config
  })
}

export function post<T = any>(url: string, data?: any, config?: Partial<RequestConfig>) {
  return request<T>({
    url,
    method: 'POST',
    data,
    ...config
  })
}

export function put<T = any>(url: string, data?: any, config?: Partial<RequestConfig>) {
  return request<T>({
    url,
    method: 'PUT',
    data,
    ...config
  })
}

export function del<T = any>(url: string, data?: any, config?: Partial<RequestConfig>) {
  return request<T>({
    url,
    method: 'DELETE',
    data,
    ...config
  })
}
