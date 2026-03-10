import { emitAuthInvalidated, isInvalidAccessMessage } from './authEvents'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

interface RequestOptions {
  method?: string
  body?: unknown
  token?: string
  skipAuth?: boolean
}

export async function api<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const token = options.skipAuth
    ? null
    : options.token || localStorage.getItem('nicedj_token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const hasAuthToken = Boolean(token)
  const res = await fetch(`${API_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const contentType = res.headers.get('content-type') ?? ''
  const payload = contentType.includes('application/json')
    ? await res.json().catch(() => null)
    : await res.text().catch(() => '')
  const errorPayload =
    payload && typeof payload === 'object'
      ? (payload as { error?: string; message?: string })
      : null
  const errorMessage =
    typeof payload === 'string'
      ? payload
      : errorPayload
        ? typeof errorPayload.error === 'string'
          ? errorPayload.error
          : typeof errorPayload.message === 'string'
            ? errorPayload.message
            : ''
        : ''

  if (!res.ok) {
    if (
      hasAuthToken &&
      (res.status === 401 ||
        res.status === 403 ||
        isInvalidAccessMessage(errorMessage))
    ) {
      emitAuthInvalidated()
    }

    throw new Error(errorMessage || 'Request failed')
  }

  return payload as T
}
