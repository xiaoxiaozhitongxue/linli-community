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
    return
  }

  // 降级方案：原生 DOM Toast
  const colorMap: Record<string, string> = {
    success: '#10b981',
    error: '#ef4444',
    info: '#6366f1'
  }
  const bgColor = colorMap[type] || '#6366f1'

  const el = document.createElement('div')
  el.textContent = message
  el.style.cssText = `
    position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
    background: ${bgColor}; color: #fff; padding: 12px 24px;
    border-radius: 8px; font-size: 14px; z-index: 999999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: toastFadeIn 0.2s ease-out;
    max-width: 80vw; text-align: center;
    pointer-events: none;
  `
  document.body.appendChild(el)

  setTimeout(() => {
    el.style.transition = 'opacity 0.3s ease'
    el.style.opacity = '0'
    setTimeout(() => el.remove(), 300)
  }, Math.min(duration, 1500))
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
