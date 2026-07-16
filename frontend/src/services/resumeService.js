import apiClient from '@/utils/axiosConfig'

let cachedResume
let pendingResume

export async function getPublicResume({ fresh = false } = {}) {
  if (!fresh && cachedResume) return cachedResume
  if (!fresh && pendingResume) return pendingResume

  pendingResume = apiClient
    .get('/api/resume')
    .then(({ data }) => {
      cachedResume = data
      return data
    })
    .finally(() => {
      pendingResume = undefined
    })

  return pendingResume
}

export function invalidateResumeCache() {
  cachedResume = undefined
  pendingResume = undefined
}
