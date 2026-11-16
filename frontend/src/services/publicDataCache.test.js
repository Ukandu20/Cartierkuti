import { describe, expect, it, vi, afterEach } from 'vitest'
import { getCachedPublicData, invalidatePublicData } from './publicDataCache'

afterEach(() => vi.useRealTimers())

describe('public data cache', () => {
  it('shares concurrent requests and reuses their result until the TTL expires', async () => {
    vi.useFakeTimers()
    const fetcher = vi.fn().mockResolvedValue(['project'])
    const first = getCachedPublicData('/api/projects', fetcher)
    const second = getCachedPublicData('/api/projects', fetcher)
    expect(first).toBe(second)
    await expect(first).resolves.toEqual(['project'])
    await getCachedPublicData('/api/projects', fetcher)
    expect(fetcher).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(60_001)
    await getCachedPublicData('/api/projects', fetcher)
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('does not let an invalidated in-flight response replace newer data', async () => {
    let completeOldRequest
    const oldRequest = getCachedPublicData('/api/projects', () => new Promise(resolve => { completeOldRequest = resolve }))
    await Promise.resolve()
    invalidatePublicData('/api/projects')
    await getCachedPublicData('/api/projects', () => Promise.resolve(['new']))
    completeOldRequest(['old'])
    await oldRequest
    await expect(getCachedPublicData('/api/projects', () => Promise.resolve(['unexpected']))).resolves.toEqual(['new'])
  })

  it('retries failures and allows explicit refreshes', async () => {
    const fetcher = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(['first']).mockResolvedValueOnce(['fresh'])
    await expect(getCachedPublicData('/api/projects', fetcher)).rejects.toThrow('offline')
    await expect(getCachedPublicData('/api/projects', fetcher)).resolves.toEqual(['first'])
    await expect(getCachedPublicData('/api/projects', fetcher, { fresh: true })).resolves.toEqual(['fresh'])
  })
})
