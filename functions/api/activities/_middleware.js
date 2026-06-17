import { handleCors } from '../../lib/index.js'
import { requireAuth } from '../../lib/auth.js'

export async function onRequest(context) {
  const { request } = context

  if (request.method === 'OPTIONS') {
    return handleCors(request)
  }

  // POST/PUT/DELETE requests require auth
  if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
    const authError = await requireAuth(context)
    if (authError) {
      return authError
    }
  }

  return context.next()
}
