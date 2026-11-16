import { describe, expect, it } from 'vitest'
import { resumeWriteSchema } from '../src/validation/schemas.js'

describe('education date contract', () => {
  const parse = item => resumeWriteSchema.safeParse({ education: [item] })
  it('accepts start-only and expected finishes for studies in progress', () => {
    expect(parse({ status: 'In progress', startDate: '2025-09' }).success).toBe(true)
    expect(parse({ status: 'In progress', startDate: '2025', expectedFinishDate: '2027-06' }).success).toBe(true)
    expect(parse({ status: 'Completed', startDate: '2021', finishDate: '2025' }).success).toBe(true)
  })
  it('rejects actual finishes for ongoing studies, invalid months, and reversed dates', () => {
    expect(parse({ status: 'In progress', finishDate: '2027' }).success).toBe(false)
    expect(parse({ startDate: '2025-13' }).success).toBe(false)
    expect(parse({ startDate: '2025-09', finishDate: '2025-06' }).success).toBe(false)
    expect(parse({ status: 'In progress', startDate: '2025', expectedFinishDate: '2024' }).success).toBe(false)
  })
})
