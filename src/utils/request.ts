const BASE_URL = ''

interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: any
  showLoading?: boolean
  showError?: boolean
}

interface ResponseData<T = any> {
  code: number
  message: string
  data: T
}

function getToken(): string {
  try {
    return uni.getStorageSync('token') || ''
  } catch (e) {
    return ''
  }
}

function showLoading(title: string = '加载中...') {
  uni.showLoading({
    title,
    mask: true
  })
}

function hideLoading() {
  uni.hideLoading()
}

function showError(message: string) {
  uni.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  })
}

export function request<T = any>(config: RequestConfig): Promise<T> {
  const { 
    url, 
    method = 'GET', 
    data, 
    header = {}, 
    showLoading: needLoading = true, 
    showError: needError = true 
  } = config

  return new Promise((resolve, reject) => {
    if (needLoading) {
      showLoading()
    }

    uni.request({
      url: BASE_URL + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': getToken() ? `Bearer ${getToken()}` : '',
        ...header
      },
      success: (res: any) => {
        if (needLoading) {
          hideLoading()
        }

        const response = res.data as ResponseData<T>
        
        if (response.code === 200 || response.code === 201) {
          resolve(response.data)
        } else {
          if (needError) {
            showError(response.message || '请求失败')
          }
          
          if (response.code === 401) {
            uni.removeStorageSync('token')
            uni.removeStorageSync('userInfo')
            uni.navigateTo({
              url: '/pages/login/index'
            })
          }
          
          reject(new Error(response.message || '请求失败'))
        }
      },
      fail: (err) => {
        if (needLoading) {
          hideLoading()
        }
        
        if (needError) {
          showError('网络请求失败，请检查网络连接')
        }
        
        reject(err)
      }
    })
  })
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
