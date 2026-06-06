import { createResponse, now, formatRelativeTime } from '../lib/index.js'

export function onRequestGet() {
  return createResponse({
    message: 'Hello from 邻里社区 API!',
    serverTime: now(),
    relativeTime: formatRelativeTime(now() - 3600)
  }, '欢迎访问邻里社区 API')
}
