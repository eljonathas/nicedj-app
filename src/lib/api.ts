const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

interface RequestOptions {
  method?: string
  body?: unknown
  token?: string
}

export async function api<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const token = options.token || localStorage.getItem('nicedj_token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.error || 'Request failed')
  }

  return json as T
}
