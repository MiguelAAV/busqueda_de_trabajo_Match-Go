import { CORS_HEADERS } from './constants.ts'

export function createResponse<T>(
  data: T,
  status = 200,
  headers = CORS_HEADERS
) {
  return new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' }
  })
}

export function createErrorResponse(
  message: string,
  status = 400,
  headers = CORS_HEADERS
) {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' }
  })
}

export function createMessageResponse(
  message: string,
  status = 200,
  headers = CORS_HEADERS
) {
  return new Response(JSON.stringify({ success: true, message }), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' }
  })
}

export function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }
  return null
}
