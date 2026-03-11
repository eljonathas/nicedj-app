const AUTH_INVALID_EVENT = 'nicedj:auth-invalid'
const DEFAULT_AUTH_INVALID_MESSAGE =
  'Sua sessão expirou. Faça login novamente.'

export function isInvalidAccessMessage(message: string | null | undefined) {
  if (!message) {
    return false
  }

  const normalized = message.trim().toLowerCase()
  return (
    normalized.includes('invalid access') ||
    normalized.includes('access token') ||
    normalized.includes('invalid session') ||
    normalized.includes('expired session') ||
    normalized.includes('token expired') ||
    normalized.includes('jwt expired') ||
    normalized.includes('unauthorized')
  )
}

export function emitAuthInvalidated(message?: string) {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(
    new CustomEvent(AUTH_INVALID_EVENT, {
      detail: {
        message: message?.trim() || DEFAULT_AUTH_INVALID_MESSAGE,
      },
    }),
  )
}

export function subscribeToAuthInvalidated(
  handler: (detail: { message: string }) => void,
) {
  if (typeof window === 'undefined') {
    return () => {}
  }

  const listener = (event: Event) => {
    const detail =
      (event as CustomEvent<{ message?: string }>).detail ?? undefined

    handler({
      message: detail?.message?.trim() || DEFAULT_AUTH_INVALID_MESSAGE,
    })
  }

  window.addEventListener(AUTH_INVALID_EVENT, listener)

  return () => {
    window.removeEventListener(AUTH_INVALID_EVENT, listener)
  }
}
