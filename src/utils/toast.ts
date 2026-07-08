/** 双弹窗去重缓存 */
let lastToastMsg = ''
let lastToastTime = 0

function ensureToast() {
  const toast = (window as any).$toast
  if (!toast) {
    console.warn('Toast 实例未初始化，请确保 App.vue 中已引入 Toast 组件')
    return null
  }
  return toast
}

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 2000) {
  // 去重：1 秒内相同 message 跳过
  const now = Date.now()
  if (message === lastToastMsg && now - lastToastTime < 1000) {
    return
  }
  lastToastMsg = message
  lastToastTime = now

  const t = ensureToast()
  if (t) {
    t.show(message, type, duration)
  }
}

export function toastSuccess(message: string, duration?: number) {
  showToast(message, 'success', duration)
}

export function toastError(message: string, duration?: number) {
  showToast(message, 'error', duration)
}

export function toastInfo(message: string, duration?: number) {
  showToast(message, 'info', duration)
}
