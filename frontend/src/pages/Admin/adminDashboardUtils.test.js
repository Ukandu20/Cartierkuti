import { describe, expect, it } from 'vitest'
import {
  buildProjectPayload,
  buildResumePayload,
  getFilteredProjects,
  getProjectAnalytics,
  getProjectCounts,
  normalizeResumeForm,
  projectToFormData,
} from './adminDashboardUtils'

describe('adminDashboardUtils', () => {
  it('normalizes and builds resume payloads', () => {
    const form = normalizeResumeForm({
      headline: ' Analyst ',
      summary: 'Summary',
      highlights: ['One', 'Two'],
      metrics: [{ label: ' Projects ', value: ' 12 ', note: ' shipped ' }],
      experience: [{ role: 'Dev', company: 'Acme', bullets: ['Built dashboards'] }],
      skills: { primary: ['SQL'], secondary: ['React'], tools: ['Git'] },
    })

    expect(form.highlightsText).toBe('One\nTwo')
    expect(buildResumePayload(form)).toMatchObject({
      headline: 'Analyst',
      highlights: ['One', 'Two'],
      metrics: [{ label: 'Projects', value: '12', note: 'shipped' }],
      skills: { primary: ['SQL'], secondary: ['React'], tools: ['Git'] },
    })
  })

  it('derives project forms, payloads, filters, counts, and analytics', () => {
    const projects = [
      { id: '1', title: 'A', status: 'In Progress', featured: true, views: 10, languages: ['JS'], tags: ['web'], createdDate: '2025-01-01' },
      { id: '2', title: 'B', status: 'Completed', featured: false, views: 4, languages: ['SQL'], tags: ['data'], createdDate: '2025-02-01' },
    ]

    expect(projectToFormData(projects[0])).toMatchObject({
      title: 'A',
      languages: 'JS',
      tags: 'web',
      featured: true,
      date: '2025-01-01',
    })
    const payload = buildProjectPayload({
      ...projectToFormData(projects[0]),
      languages: 'JS, Node',
      tags: 'web, api',
      date: '2025-01-01',
    })
    expect(payload).toMatchObject({
      languages: ['JS', 'Node'],
      tags: ['web', 'api'],
    })
    expect(payload).not.toHaveProperty('date')
    expect(getFilteredProjects(projects, 'active')).toHaveLength(1)
    expect(getProjectCounts(projects)).toEqual({ started: 1, finished: 1, total: 2 })
    expect(getProjectAnalytics(projects)).toMatchObject({ totalViews: 14, avgViews: 7, featured: 1 })
  })
})
