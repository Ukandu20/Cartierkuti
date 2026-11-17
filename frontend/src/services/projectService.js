import apiClient from '@/utils/axiosConfig'
import { normalizeProject, normalizeProjects } from '@/utils/projectNormalizer'
import { getCachedPublicData } from './publicDataCache'

export function getSelectedPublicProjects({ fresh = false } = {}) {
  const path = '/api/projects/selected?limit=3'
  return getCachedPublicData(path, async () => normalizeProjects((await apiClient.get(path)).data), { fresh })
}

export function getPublicProjectPage({ page = 1, limit = 9, category = 'all', search = '', sort = 'date' } = {}, options) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit), category, search: search.trim(), sort })
  const path = `/api/projects/browse?${params}`
  return getCachedPublicData(path, async () => {
    const { data } = await apiClient.get(path)
    return {
      ...data, projects: normalizeProjects(data.projects),
      featuredProject: data.featuredProject ? normalizeProject(data.featuredProject) : null,
      categories: Array.isArray(data.categories) ? data.categories : [],
    }
  }, options)
}

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
