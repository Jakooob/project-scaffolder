const API_BASE = '/api'

let antiforgeryToken: string | null = null

async function fetchAntiforgeryToken(forceRefresh = false): Promise<string> {
  if (antiforgeryToken && !forceRefresh) {
    return antiforgeryToken
  }

  const response = await fetch(`${API_BASE}/auth/antiforgery`, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch antiforgery token')
  }

  const data = await response.json()
  antiforgeryToken = data.token
  return antiforgeryToken!
}

export function clearAntiforgeryToken(): void {
  antiforgeryToken = null
}

export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized')
    }
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || 'Request failed')
  }

  return response.json()
}

export async function apiPost<T>(endpoint: string, body?: unknown, isRetry = false): Promise<T> {
  const token = await fetchAntiforgeryToken()

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': token,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  // If we get 400, it might be an invalid antiforgery token - retry once with fresh token
  if (response.status === 400 && !isRetry) {
    clearAntiforgeryToken()
    return apiPost<T>(endpoint, body, true)
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized')
    }
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || 'Request failed')
  }

  return response.json()
}
