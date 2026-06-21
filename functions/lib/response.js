import { corsHeaders } from './cors.js'

export function createResponse(data, message = '成功', status = 200) {
  return new Response(
    JSON.stringify({
      success: true,
      message,
      data,
      timestamp: Date.now()
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders()
      }
    }
  )
}

export function createErrorResponse(code, message, details = null) {
  const response = {
    success: false,
    message,
    error: {
      code,
      message
    },
    timestamp: Date.now()
  }

  if (details) {
    response.error.details = details
  }

  return new Response(JSON.stringify(response), {
    status: code,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders()
    }
  })
}

export function createPaginatedResponse(items, page, limit, total, message = '成功') {
  return createResponse(
    {
      items,
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit)
    },
    message
  )
}
