export function generateId() {
  return crypto.randomUUID()
}

export function now() {
  return Math.floor(Date.now() / 1000)
}

export function formatDate(timestamp) {
  const date = new Date(timestamp * 1000)
  return date.toISOString()
}

export function formatRelativeTime(timestamp) {
  const now = Math.floor(Date.now() / 1000)
  const diff = now - timestamp

  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  if (diff < 604800) return `${Math.floor(diff / 86400)}天前`

  return formatDate(timestamp)
}

export function parseJsonBody(request) {
  return request.json()
}

export function getQueryParams(request) {
  const url = new URL(request.url)
  const params = {}
  for (const [key, value] of url.searchParams) {
    params[key] = value
  }
  return params
}

export function validateRequired(data, requiredFields) {
  const missing = []
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missing.push(field)
    }
  }
  return missing
}

export function validatePhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone)
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
