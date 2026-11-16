import { afterEach, describe, expect, it, vi } from 'vitest'
import apiClient from '@/utils/axiosConfig'
import { getPublicProjects, getPublicCategories } from './projectService'

vi.mock('@/utils/apiConfig', () => ({ requireApiBaseUrl: () => 'https://api.example.test' }))

const originalAdapter = apiClient.defaults.adapter
afterEach(() => { apiClient.defaults.adapter = originalAdapter })

describe('public project requests', () => {
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
