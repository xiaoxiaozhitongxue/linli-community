import { createResponse, createErrorResponse } from './lib/response.js'
import { corsHeaders, handleCors } from './lib/cors.js'

export async function onRequest(context) {
  const { request } = context

  if (request.method === 'OPTIONS') {
    return handleCors(request)
  }

  try {
    const response = await context.next()

    const newHeaders = new Headers(response.headers)
    for (const [key, value] of Object.entries(corsHeaders())) {
      newHeaders.set(key, value)
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    })
  } catch (error) {
    console.error('Middleware error:', error)
    return createErrorResponse(500, '服务器内部错误', error.message)
  }
}
