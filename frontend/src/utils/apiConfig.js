export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '')

export function requireApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error(
      'Missing VITE_API_URL environment variable. Define it as the public backend origin.',
    )
  }
  return API_BASE_URL
}

export function apiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath
}
