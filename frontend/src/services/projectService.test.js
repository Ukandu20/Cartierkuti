import { afterEach, describe, expect, it, vi } from 'vitest'
import apiClient from '@/utils/axiosConfig'
import { getPublicProjects, getPublicCategories, getPublicProjectPage, getSelectedPublicProjects } from './projectService'

vi.mock('@/utils/apiConfig', () => ({ requireApiBaseUrl: () => 'https://api.example.test' }))

const originalAdapter = apiClient.defaults.adapter
afterEach(() => { apiClient.defaults.adapter = originalAdapter })

describe('public project requests', () => {
  it.each([400, 404])('loads selected work and paginated filters from an older backend (%s)', async status => {
    const projects = Array.from({ length: 14 }, (_, index) => ({
      _id: `project-${String(index).padStart(2, '0')}`, title: `Project ${String(index).padStart(2, '0')}`,
      category: index < 12 ? 'Sports Analytics' : 'Web Applications',
      categorySlug: index < 12 ? 'sports-analytics' : 'web-applications',
      featured: index === 1, views: index, tools: ['Python'],
      reviews: [{ stars: 4 }],
    }))
    const adapter = vi.fn(async config => {
      if (config.url.includes('/browse?') || config.url.includes('/selected?')) {
        throw { response: { status, data: { errors: [{ path: 'id', message: 'Invalid Mongo ObjectId' }] } } }
      }
      return { data: config.url === '/api/projects' ? projects : [{ name: 'Sports Analytics', slug: 'sports-analytics' }, { name: 'Web Applications', slug: 'web-applications' }], status: 200, headers: {}, config }
    })
    apiClient.defaults.adapter = adapter
    expect((await getSelectedPublicProjects()).map(item => item.id)).toEqual(['project-01', 'project-13', 'project-12'])
    const result = await getPublicProjectPage({ page: 2, limit: 9, category: 'sports-analytics', search: 'Python', sort: 'title' })
    expect(result).toMatchObject({ total: 12, totalProjects: 14, page: 2 })
    expect(result.projects.map(item => item.id)).toEqual(['project-09', 'project-10', 'project-11'])
    expect(result.projects[0]).toMatchObject({ avgStars: 4, reviewCount: 1 })
    expect(result.featuredProject.id).toBe('project-01')
    expect(result.categories).toEqual(expect.arrayContaining([
      expect.objectContaining({ slug: 'sports-analytics', count: 12 }),
      expect.objectContaining({ slug: 'web-applications', count: 2 }),
    ]))
    expect(adapter.mock.calls.filter(([config]) => config.url === '/api/projects')).toHaveLength(1)
    await getSelectedPublicProjects({ fresh: true })
    expect(adapter.mock.calls.filter(([config]) => config.url === '/api/projects')).toHaveLength(2)
  })

  it.each([400, 500])('keeps genuine API errors visible instead of using legacy data (%s)', async status => {
    const error = { response: { status, data: { errors: [{ path: 'limit', message: 'Invalid limit' }] } } }
    const adapter = vi.fn(async () => { throw error })
    apiClient.defaults.adapter = adapter
    await expect(getSelectedPublicProjects()).rejects.toBe(error)
    await expect(getPublicProjectPage()).rejects.toBe(error)
    expect(adapter).toHaveBeenCalledTimes(2)
  })

  it('caches each bounded query and invalidates all variants after a project write', async () => {
    const adapter = vi.fn(async config => ({
      data: config.url.includes('/browse') ? { projects: [], categories: [], total: 0, totalProjects: 0 } : [],
      status: 200, statusText: 'OK', headers: {}, config,
    }))
    apiClient.defaults.adapter = adapter
    await getSelectedPublicProjects()
    await getPublicProjectPage({ page: 1 })
    await getPublicProjectPage({ page: 2 })
    await getPublicProjectPage({ page: 1 })
    expect(adapter).toHaveBeenCalledTimes(3)
    expect(adapter.mock.calls[0][0].url).toBe('/api/projects/selected?limit=3')
    expect(adapter.mock.calls[1][0].url).toContain('limit=9')
    await apiClient.post('/api/projects/project/reviews', { stars: 5, comment: 'Useful' })
    await getSelectedPublicProjects()
    await getPublicProjectPage({ page: 1 })
    await getPublicProjectPage({ page: 2 })
    expect(adapter).toHaveBeenCalledTimes(7)
  })
  it('invalidates cached projects and categories after a successful admin category update', async () => {
    const adapter = vi.fn(async config => ({
      data: config.url === '/api/projects' ? [{ _id: 'project', title: 'Example' }] : [{ slug: 'web-applications', name: 'Web Applications' }],
      status: 200, statusText: 'OK', headers: {}, config,
    }))
    apiClient.defaults.adapter = adapter
    await getPublicProjects()
    await getPublicCategories()
    await getPublicProjects()
    expect(adapter).toHaveBeenCalledTimes(2)
    await apiClient.put('/api/categories/category-id', { name: 'Updated' })
    await getPublicProjects()
    await getPublicCategories()
    expect(adapter).toHaveBeenCalledTimes(5)
  })

  it('keeps public cached data after a failed admin write', async () => {
    const adapter = vi.fn(async config => {
      if (config.method === 'put') throw new Error('write failed')
      return { data: [{ _id: 'project', title: 'Example' }], status: 200, statusText: 'OK', headers: {}, config }
    })
    apiClient.defaults.adapter = adapter
    await getPublicProjects()
    await expect(apiClient.put('/api/projects/project', { title: 'Failed' })).rejects.toThrow('write failed')
    await getPublicProjects()
    expect(adapter).toHaveBeenCalledTimes(2)
  })
})
