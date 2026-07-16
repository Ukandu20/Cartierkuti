import { describe, expect, it } from 'vitest'
import { sortProjects } from './projectSorting'

const projects = [
  { title: 'Zulu', views: 2, createdDate: '2025-01-01' },
  { title: 'Alpha', views: 10, createdDate: '2026-01-01' },
]

describe('sortProjects', () => {
  it.each([
    ['date', ['Alpha', 'Zulu']],
    ['views', ['Alpha', 'Zulu']],
    ['title', ['Alpha', 'Zulu']],
  ])('sorts by %s without mutating the input', (sort, expected) => {
    const original = [...projects]
    expect(sortProjects(projects, sort).map(({ title }) => title)).toEqual(expected)
    expect(projects).toEqual(original)
  })
})
