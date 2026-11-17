const entries = new Map()
const CACHE_TTL_MS = 60_000
const MAX_CACHE_ENTRIES = 60

export function getCachedPublicData(key, fetcher, { fresh = false } = {}) {
  for (const [entryKey, entry] of entries) {
    if (!entry.pending && entry.expiresAt <= Date.now()) entries.delete(entryKey)
  }
  const cached = entries.get(key)
  if (!fresh && cached) {
    if (cached.pending) return cached.pending
    if (cached.expiresAt > Date.now()) return Promise.resolve(cached.value)
  }
  const entry = {}
  if (!entries.has(key) && entries.size >= MAX_CACHE_ENTRIES) entries.delete(entries.keys().next().value)
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
  if (key) {
    for (const entryKey of entries.keys()) {
      if (entryKey === key || entryKey.startsWith(`${key}?`) || entryKey.startsWith(`${key}/`)) entries.delete(entryKey)
    }
  } else entries.clear()
}
