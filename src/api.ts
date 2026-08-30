const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:5000'

export type PredictionResult = {
  diagnosis: string
  confidence: number
  notes: string
}

async function readResponse(response: Response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed (${response.status})`)
  }
  return data
}

export async function authenticate(
  mode: 'login' | 'register',
  username: string,
  password: string,
  contact?: { email: string; mobile: string },
  source?: 'web',
) {
  const response = await fetch(`${API_URL}/${mode}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ username, password, ...contact, ...(source ? { source } : {}) }),
  })
  return readResponse(response)
}

export async function predictImage(file: File, token: string, location?: { latitude: number; longitude: number }) {
  const form = new FormData()
  form.append('image', file)
  if (location) {
    form.append('latitude', location.latitude.toString())
    form.append('longitude', location.longitude.toString())
  }

  const response = await fetch(`${API_URL}/predict`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    body: form,
  })
  return readResponse(response) as Promise<{
    disease: string
    confidence: number
    message: string
  }>
}

export async function fetchHistory(token: string) {
  const response = await fetch(`${API_URL}/history`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  return readResponse(response) as Promise<{
    history: HistoryRecord[]
  }>
}

export type HistoryRecord = {
  id: number
  disease: string
  confidence: number
  timestamp: string
  username?: string
  latitude?: number
  longitude?: number
}

export async function fetchAllHistory(token: string) {
  const response = await fetch(`${API_URL}/admin/history`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  return readResponse(response) as Promise<{ history: HistoryRecord[] }>
}
