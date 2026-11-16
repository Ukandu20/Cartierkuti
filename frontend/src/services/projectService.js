import apiClient from '@/utils/axiosConfig'
import { normalizeProjects } from '@/utils/projectNormalizer'
import { getCachedPublicData } from './publicDataCache'

export const getPublicProjects = (options) => getCachedPublicData(
  '/api/projects',
  async () => normalizeProjects((await apiClient.get('/api/projects')).data),
  options,
)

export const getPublicCategories = (options) => getCachedPublicData(
  '/api/categories',
  async () => {
    const { data } = await apiClient.get('/api/categories')
    return Array.isArray(data) ? data.filter(item => item?.slug && item?.name) : []
  },
  options,
)
