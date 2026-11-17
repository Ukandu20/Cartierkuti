import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAdminActivities } from './useAdminActivities'
import apiClient from '@/utils/axiosConfig'

vi.mock('@/utils/axiosConfig', () => ({ default: { get: vi.fn() } }))
const event = title => ({ _id: title, title, type: 'Created' })

describe('activity requests', () => {
  beforeEach(() => apiClient.get.mockReset())

  it('applies filters and resets pagination with one request, then clears atomically', async () => {
    apiClient.get.mockResolvedValue({ data: { activities: [], total: 40 } })
    const { result } = renderHook(() => useAdminActivities({ isAuth: true, pageSize: 10 }))
    await waitFor(() => expect(apiClient.get).toHaveBeenCalledTimes(1))
    act(() => result.current.setPage(3))
    await waitFor(() => expect(apiClient.get).toHaveBeenCalledTimes(2))
    const refreshFromEarlierRender = result.current.fetchActivities
    act(() => result.current.applyFilters({ type: 'Updated', startDate: '2026-01-01', endDate: '2026-01-31' }))
    await waitFor(() => expect(apiClient.get).toHaveBeenCalledTimes(3))
    expect(apiClient.get.mock.lastCall[1].params).toEqual({ page: 1, limit: 10, type: 'Updated', startDate: '2026-01-01', endDate: '2026-01-31' })
    await act(async () => { await refreshFromEarlierRender() })
    expect(apiClient.get.mock.lastCall[1].params.type).toBe('Updated')
    act(() => result.current.clearFilters())
    await waitFor(() => expect(apiClient.get).toHaveBeenCalledTimes(5))
    expect(apiClient.get.mock.lastCall[1].params).toEqual({ page: 1, limit: 10 })
  })

  it('aborts superseded requests and ignores a late response even when cancellation is ignored', async () => {
    let finishOld
    apiClient.get.mockImplementationOnce(() => new Promise(resolve => { finishOld = resolve }))
      .mockResolvedValueOnce({ data: { activities: [event('Latest event')], total: 1 } })
    const { result } = renderHook(() => useAdminActivities({ isAuth: true, pageSize: 10 }))
    const oldSignal = apiClient.get.mock.calls[0][1].signal
    act(() => result.current.applyFilters({ type: 'Updated' }))
    await waitFor(() => expect(result.current.activities[0]?.title).toBe('Latest event'))
    expect(oldSignal.aborted).toBe(true)
    await act(async () => { finishOld({ data: { activities: [event('Old event')], total: 99 } }) })
    expect(result.current.activities[0].title).toBe('Latest event')
    expect(result.current.totalActivities).toBe(1)
  })

  it('retains previous events after a failed refresh and clears the error on retry', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { activities: [event('Saved event')], total: 1 } })
      .mockRejectedValueOnce(new Error('Offline'))
      .mockResolvedValueOnce({ data: { activities: [event('Refreshed event')], total: 1 } })
    const { result } = renderHook(() => useAdminActivities({ isAuth: true, pageSize: 10 }))
    await waitFor(() => expect(result.current.activities).toHaveLength(1))
    await act(async () => { await result.current.fetchActivities() })
    expect(result.current.error).toBe('Activity could not be loaded.')
    expect(result.current.activities[0].title).toBe('Saved event')
    await act(async () => { await result.current.fetchActivities() })
    expect(result.current.error).toBe('')
    expect(result.current.activities[0].title).toBe('Refreshed event')
  })

  it('avoids unauthenticated reads and removes activity after logout', async () => {
    apiClient.get.mockResolvedValue({ data: { activities: [event('Private event')], total: 1 } })
    const { result, rerender } = renderHook(({ isAuth }) => useAdminActivities({ isAuth, pageSize: 10 }), { initialProps: { isAuth: false } })
    expect(apiClient.get).not.toHaveBeenCalled()
    rerender({ isAuth: true })
    await waitFor(() => expect(result.current.activities).toHaveLength(1))
    rerender({ isAuth: false })
    expect(result.current.activities).toEqual([])
    await act(async () => { await result.current.fetchActivities() })
    expect(apiClient.get).toHaveBeenCalledTimes(1)
  })
})
