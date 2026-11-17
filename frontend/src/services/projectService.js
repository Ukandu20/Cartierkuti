import apiClient from '@/utils/axiosConfig'
import { normalizeProject, normalizeProjects } from '@/utils/projectNormalizer'
import { getCachedPublicData } from './publicDataCache'
import { getPopulatedProjectCategories, isProjectInCategory } from '@/utils/projectCategories'
import { sortProjects } from '@/utils/projectSorting'

// Older servers interpret these new route names as project IDs. Only use the
// legacy API for missing routes; other API errors must still surface.
const isMissingProjectRoute = error => error.response?.status === 404 || (
  error.response?.status === 400 &&
  (error.response.data?.errors || error.response.data?.details || []).some(
    issue => issue.path === 'id' && issue.message === 'Invalid Mongo ObjectId',
  )
)
const selectedProjects = projects => [...projects].sort((a, b) =>
  Number(b.featured) - Number(a.featured) || (b.views || 0) - (a.views || 0) || String(a.id).localeCompare(String(b.id)),
)

export function getSelectedPublicProjects({ fresh = false } = {}) {
  const path = '/api/projects/selected?limit=3'
  return getCachedPublicData(path, async () => {
    try { return normalizeProjects((await apiClient.get(path)).data) }
    catch (error) {
      if (!isMissingProjectRoute(error)) throw error
      return selectedProjects(await getPublicProjects({ fresh })).slice(0, 3)
    }
  }, { fresh })
}

export function getPublicProjectPage({ page = 1, limit = 9, category = 'all', search = '', sort = 'date' } = {}, options) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit), category, search: search.trim(), sort })
  const path = `/api/projects/browse?${params}`
  return getCachedPublicData(path, async () => {
    let data
    try { ({ data } = await apiClient.get(path)) }
    catch (error) {
      if (!isMissingProjectRoute(error)) throw error
      const [projects, categories] = await Promise.all([
        getPublicProjects(options), getPublicCategories(options).catch(() => []),
      ])
      const term = search.trim().toLowerCase()
      const filtered = projects.filter(project => isProjectInCategory(project, category) &&
        [project.title, project.description, project.category, project.status, ...(project.tags || []), ...(project.methods || []), ...(project.tools || []), ...(project.languages || [])]
          .filter(Boolean).join(' ').toLowerCase().includes(term))
      data = {
        projects: sortProjects(filtered, sort).slice((page - 1) * limit, page * limit),
        total: filtered.length, totalProjects: projects.length, page, limit,
        featuredProject: selectedProjects(projects)[0] || null,
        categories: getPopulatedProjectCategories(projects, categories.length ? categories : undefined)
          .filter(item => item.value !== 'all')
          .map(item => ({ slug: item.value, name: item.label, count: projects.filter(project => isProjectInCategory(project, item.value)).length })),
      }
    }
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
