import { describe, expect, it } from 'vitest'
import { normalizeProject, normalizeProjects } from './projectNormalizer'

describe('project normalization', () => {
  it('maps backend _id, featured, and timestamp fields to frontend-safe fields', () => {
    const normalized = normalizeProject({
      _id: 'abc123',
      title: 'Project',
      featured: true,
      createdDate: '2026-01-01T00:00:00.000Z',
      lastUpdatedDate: '2026-01-02T00:00:00.000Z',
    })

    expect(normalized.id).toBe('abc123')
    expect(normalized.featured).toBe(true)
    expect(normalized.createdDate).toBe('2026-01-01T00:00:00.000Z')
    expect(normalized.lastUpdatedDate).toBe('2026-01-02T00:00:00.000Z')
  })

  it('normalizes arrays and supports legacy isFeatured data', () => {
    expect(normalizeProjects([{ _id: '1', isFeatured: true }])).toEqual([
      expect.objectContaining({ id: '1', featured: true }),
    ])
  })

  it('normalizes category labels and aliases', () => {
    expect(normalizeProject({ _id: '1', category: 'Machine Learning/AI' })).toMatchObject({
      category: 'AI/ML',
      categoryValue: 'ai-ml',
    })
    expect(normalizeProject({ _id: '2', category: 'Other' })).toMatchObject({
      category: 'Others',
      categoryValue: 'others',
    })
  })
})
