import { handleCors } from '../../../../lib/index.js'

export async function onRequest(context) {
  const { request } = context

  if (request.method === 'OPTIONS') {
    return handleCors(request)
  }

  return context.next()
}
