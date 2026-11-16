const entries = new Map()
const CACHE_TTL_MS = 60_000

export function getCachedPublicData(key, fetcher, { fresh = false } = {}) {
  const cached = entries.get(key)
  if (!fresh && cached) {
    if (cached.pending) return cached.pending
    if (cached.expiresAt > Date.now()) return Promise.resolve(cached.value)
  }
  const entry = {}
  entries.set(key, entry)
  entry.pending = Promise.resolve().then(fetcher).then((value) => {
    // An invalidation or fresh request may have replaced this in-flight entry.
    if (entries.get(key) === entry) {
      entry.value = value
      entry.expiresAt = Date.now() + CACHE_TTL_MS
      entry.pending = undefined
    }
    return value
  }).catch((error) => {
    if (entries.get(key) === entry) entries.delete(key)
    throw error
  })
  return entry.pending
}

export function invalidatePublicData(key) {
  if (key) entries.delete(key)
  else entries.clear()
}
