import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getPublicProjectPage } from '@/services/projectService'
import { useProjectBrowser } from './useProjectBrowser'

vi.mock('@/services/projectService', () => ({ getPublicProjectPage: vi.fn() }))
const resultPage = title => ({ projects: [{ id: title, title }], total: 30, totalProjects: 30, categories: [], featuredProject: { id: title, title } })

describe('project browser requests', () => {
  beforeEach(() => getPublicProjectPage.mockReset())

  it('requests only one page and resets pagination together with changed filters', async () => {
    getPublicProjectPage.mockResolvedValue(resultPage('Project'))
    const { result } = renderHook(() => useProjectBrowser())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(getPublicProjectPage.mock.calls[0][0]).toMatchObject({ page: 1, limit: 9 })
    act(() => result.current.setPage(2))
    await waitFor(() => expect(getPublicProjectPage).toHaveBeenCalledTimes(2))
    act(() => result.current.setCategory('sports-analytics'))
    await waitFor(() => expect(getPublicProjectPage).toHaveBeenCalledTimes(3))
    expect(getPublicProjectPage.mock.lastCall[0]).toMatchObject({ page: 1, category: 'sports-analytics', limit: 9 })
  })

  it('debounces search text instead of requesting every keystroke', async () => {
    getPublicProjectPage.mockResolvedValue(resultPage('Project'))
    const { result } = renderHook(() => useProjectBrowser())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => { result.current.setSearch('p'); result.current.setSearch('py'); result.current.setSearch('python') })
    expect(getPublicProjectPage).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(getPublicProjectPage).toHaveBeenCalledTimes(2))
    expect(getPublicProjectPage.mock.lastCall[0].search).toBe('python')
  })

  it('ignores a late result for old filters and retains the newer page', async () => {
    let resolveOld
    getPublicProjectPage.mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve }))
      .mockResolvedValueOnce(resultPage('New result'))
    const { result } = renderHook(() => useProjectBrowser())
    act(() => result.current.setCategory('sports-analytics'))
    await waitFor(() => expect(result.current.data?.projects[0].title).toBe('New result'))
    await act(async () => { resolveOld(resultPage('Old result')) })
    expect(result.current.data.projects[0].title).toBe('New result')
  })

  it('retries failed requests without using a cached response', async () => {
    getPublicProjectPage.mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce(resultPage('Recovered'))
    const { result } = renderHook(() => useProjectBrowser())
    await waitFor(() => expect(result.current.error).toBeTruthy())
    await act(async () => { await result.current.retry() })
    expect(getPublicProjectPage.mock.lastCall[1]).toEqual({ fresh: true })
    expect(result.current.data.projects[0].title).toBe('Recovered')
  })
})
