import { emitAuthInvalidated, isInvalidAccessMessage } from './authEvents'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const CSRF_COOKIE = 'nicedj_csrf_token'
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

interface RequestOptions {
  method?: string
  body?: unknown
  skipAuth?: boolean
}

function isAuthFailure(status: number, errorMessage: string) {
  return status === 401 || isInvalidAccessMessage(errorMessage)
}

function getCookieValue(name: string) {
  if (typeof document === 'undefined') {
    return null
  }

  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [rawName, ...rawValue] = cookie.split('=')
    if (rawName?.trim() !== name) {
      continue
    }

    return decodeURIComponent(rawValue.join('=').trim())
  }

  return null
}

function buildHeaders(options: RequestOptions) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const method = (options.method || 'GET').toUpperCase()
  if (!SAFE_METHODS.has(method)) {
    const csrfToken = getCookieValue(CSRF_COOKIE)
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken
    }
  }

  return headers
}

export function getCsrfToken() {
  return getCookieValue(CSRF_COOKIE)
}

export async function probeSession(): Promise<'valid' | 'invalid' | 'error'> {
  try {
    const res = await fetch(`${API_URL}/api/auth/session`, {
      method: 'GET',
      credentials: 'include',
    })

    if (res.ok) {
      return 'valid'
    }

    if (res.status === 401 || res.status === 403) {
      return 'invalid'
    }

    return 'error'
  } catch {
    return 'error'
  }
}

async function request(path: string, options: RequestOptions) {
  return fetch(`${API_URL}${path}`, {
    method: options.method || 'GET',
    headers: buildHeaders(options),
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: 'include',
  })
}

export async function api<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const res = await request(path, options)

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
    const authFailure = !options.skipAuth && isAuthFailure(res.status, errorMessage)
    if (authFailure) {
      emitAuthInvalidated()
    }

    throw new Error(errorMessage || 'Request failed')
  }

  return payload as T
}
