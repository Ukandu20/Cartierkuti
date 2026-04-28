import { describe, expect, it } from 'vitest'
import { getCategoryLabel, isProjectInCategory, normalizeCategoryValue } from './projectCategories'

describe('project category helpers', () => {
  it('normalizes canonical labels and backend aliases', () => {
    expect(normalizeCategoryValue('Machine Learning/AI')).toBe('ai-ml')
    expect(normalizeCategoryValue('AI/ML')).toBe('ai-ml')
    expect(normalizeCategoryValue('Other')).toBe('others')
    expect(getCategoryLabel('machine learning')).toBe('AI/ML')
  })

  it('matches projects against normalized filters', () => {
    const project = { category: 'Machine Learning/AI' }
    expect(isProjectInCategory(project, 'AI/ML')).toBe(true)
    expect(isProjectInCategory(project, 'all')).toBe(true)
    expect(isProjectInCategory(project, 'Data Science')).toBe(false)
  })
})
