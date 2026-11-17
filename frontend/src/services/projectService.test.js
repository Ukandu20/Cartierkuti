import { afterEach, describe, expect, it, vi } from 'vitest'
import apiClient from '@/utils/axiosConfig'
import { getPublicProjects, getPublicCategories, getPublicProjectPage, getSelectedPublicProjects } from './projectService'

vi.mock('@/utils/apiConfig', () => ({ requireApiBaseUrl: () => 'https://api.example.test' }))

const originalAdapter = apiClient.defaults.adapter
afterEach(() => { apiClient.defaults.adapter = originalAdapter })

describe('public project requests', () => {
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
