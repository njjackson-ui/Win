const API_KEY = '87ea98371d91a1cce111db8dabebc80eeb880a51'
const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

async function apiFetch(path, options = {}) {
  const url = BASE_URL ? `${BASE_URL}${path}` : path
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`)
  return res.json()
}

export const getDevices = () => apiFetch('/api/devices')

export const getDeviceLogs = (deviceId, { search = '', page = 1, limit = 100 } = {}) => {
  const params = new URLSearchParams({ page, limit })
  if (search) params.set('search', search)
  return apiFetch(`/api/devices/${encodeURIComponent(deviceId)}/logs?${params}`)
}
