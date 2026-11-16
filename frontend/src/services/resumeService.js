import apiClient from '@/utils/axiosConfig'
import { getCachedPublicData, invalidatePublicData } from './publicDataCache'

export const getPublicResume = (options) => getCachedPublicData(
  '/api/resume', async () => (await apiClient.get('/api/resume')).data, options,
)

export function invalidateResumeCache() {
  invalidatePublicData('/api/resume')
}
