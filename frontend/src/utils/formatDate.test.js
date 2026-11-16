import { describe, expect, it } from 'vitest'
import { calendarDate } from './formatDate'

describe('calendarDate', () => {
  it.each(['America/Toronto', 'UTC', 'Pacific/Kiritimati'])(
    'preserves a date-only value in %s', (timeZone) => {
      expect(calendarDate('2025-03-14', { locale: 'en-US', timeZone })).toBe('Mar 14, 2025')
    },
  )

  it('converts actual timestamps to the selected timezone', () => {
    const timestamp = '2025-03-14T00:00:00.000Z'
    expect(calendarDate(timestamp, { locale: 'en-US', timeZone: 'America/Toronto' })).toBe('Mar 13, 2025')
    expect(calendarDate(timestamp, { locale: 'en-US', timeZone: 'UTC' })).toBe('Mar 14, 2025')
  })

  it('handles invalid dates', () => {
    expect(calendarDate('invalid')).toBe('—')
  })
})
