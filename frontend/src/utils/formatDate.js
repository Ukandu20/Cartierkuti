// src/utils/formatDate.js
export function niceDate(input) {
  const d = new Date(input)
  const now = new Date()
  const optsTime = { hour: '2-digit', minute: '2-digit' }
  // helper to compare just the Y/M/D
  const sameDay = (a, b) => a.toDateString() === b.toDateString()

  if (sameDay(d, now)) {
    // today
    return `Today at ${d.toLocaleTimeString([], optsTime)}`
  }

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (sameDay(d, yesterday)) {
    return `Yesterday at ${d.toLocaleTimeString([], optsTime)}`
  }

  // anything else — just the date
  return d.toLocaleDateString(undefined, {
    year:  'numeric',
    month: 'short',
    day:   'numeric',
  })
}
