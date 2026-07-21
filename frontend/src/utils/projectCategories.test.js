import { describe, expect, it } from 'vitest'
import { getCategoryLabel, getPopulatedProjectCategories, isProjectInCategory, normalizeCategoryValue } from './projectCategories'

describe('project category helpers', () => {
  it('normalizes canonical labels and backend aliases', () => {
    expect(normalizeCategoryValue('Machine Learning/AI')).toBe('machine-learning-forecasting')
    expect(normalizeCategoryValue('AI/ML')).toBe('machine-learning-forecasting')
    expect(normalizeCategoryValue('Data Science')).toBe('machine-learning-forecasting')
    expect(normalizeCategoryValue('Data Engineering')).toBe('data-systems-pipelines')
    expect(getCategoryLabel('machine learning')).toBe('Machine Learning & Forecasting')
  })

  it('matches projects against normalized filters', () => {
    const project = { category: 'Machine Learning/AI' }
    expect(isProjectInCategory(project, 'Machine Learning & Forecasting')).toBe(true)
    expect(isProjectInCategory(project, 'all')).toBe(true)
    expect(isProjectInCategory(project, 'Data Analytics & BI')).toBe(false)
  })

  it('returns only categories represented by existing projects', () => {
    expect(getPopulatedProjectCategories([
      { category: 'Sports Analytics' },
      { category: 'Web Development' },
    ]).map((category) => category.label)).toEqual([
      'All',
      'Sports Analytics',
      'Web Applications',
    ])
  })
})
