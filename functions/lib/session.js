import { generateId, now } from './utils.js'

const JWT_SECRET_DEFAULT = 'linli-community-secret-key-2024'
const TOKEN_EXPIRE = 7 * 24 * 60 * 60

function getJwtSecret(context) {
  if (context && context.env && context.env.JWT_SECRET) {
    return context.env.JWT_SECRET
  }
  return JWT_SECRET_DEFAULT
}

function base64UrlEncode(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) {
    str += '='
  }
  return atob(str)
}

async function hmacSha256(data, secret) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
  return base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)))
}

export async function createToken(payload, context) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const nowTimestamp = now()
  const tokenPayload = {
    ...payload,
    iat: nowTimestamp,
    exp: nowTimestamp + TOKEN_EXPIRE
  }

  const headerB64 = base64UrlEncode(JSON.stringify(header))
  const payloadB64 = base64UrlEncode(JSON.stringify(tokenPayload))
  const signature = await hmacSha256(`${headerB64}.${payloadB64}`, getJwtSecret(context))

  return `${headerB64}.${payloadB64}.${signature}`
}

export async function verifyToken(token, context) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const [headerB64, payloadB64, signature] = parts
    const expectedSignature = await hmacSha256(`${headerB64}.${payloadB64}`, getJwtSecret(context))

    if (signature !== expectedSignature) {
      return null
    }

    const payload = JSON.parse(base64UrlDecode(payloadB64))

    if (payload.exp && payload.exp < now()) {
      return null
    }

    return payload
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

export function getTokenFromRequest(request) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) {
    return null
  }

  const [type, token] = authHeader.split(' ')
  if (type !== 'Bearer' || !token) {
    return null
  }

  return token
}

export async function createSession(userId) {
  const sessionId = generateId()
  return sessionId
}
