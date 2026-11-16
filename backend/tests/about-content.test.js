import { describe, expect, it } from 'vitest'
import { resumeWriteSchema } from '../src/validation/schemas.js'

describe('editable About page text', () => {
  it('accepts partial text, cleared fields, and an empty principles list', () => {
    const pageContent = { heroTitle: 'My story', ctaDescription: '', principles: [] }
    expect(resumeWriteSchema.parse({ pageContent }).pageContent).toEqual(pageContent)
    expect(resumeWriteSchema.parse({}).pageContent).toBeUndefined()
  })
  it('rejects unsupported keys, oversized metadata, and too many working approaches', () => {
    expect(resumeWriteSchema.safeParse({ pageContent: { unknown: 'text' } }).success).toBe(false)
    expect(resumeWriteSchema.safeParse({ pageContent: { metaDescription: 'a'.repeat(321) } }).success).toBe(false)
    expect(resumeWriteSchema.safeParse({ pageContent: { principles: Array(13).fill({ title: 'Approach' }) } }).success).toBe(false)
  })
})
