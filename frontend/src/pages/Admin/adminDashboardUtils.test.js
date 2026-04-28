import { describe, expect, it } from 'vitest'
import {
  buildProjectPayload,
  buildResumePayload,
  getFilteredProjects,
  getProjectAnalytics,
  getProjectCounts,
  normalizeResumeForm,
  projectWriteContractFields,
  projectToFormData,
  validateProjectForm,
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
      title: 'A',
      languages: ['JS', 'Node'],
      tags: ['web', 'api'],
    })
    expect(payload).not.toHaveProperty('date')
    expect(Object.keys(payload).sort()).toEqual(projectWriteContractFields)
    expect(getFilteredProjects(projects, 'active')).toHaveLength(1)
    expect(getProjectCounts(projects)).toEqual({ started: 1, finished: 1, total: 2 })
    expect(getProjectAnalytics(projects)).toMatchObject({ totalViews: 14, avgViews: 7, featured: 1 })
  })

  it('validates project forms before matching the backend write schema', () => {
    const invalid = validateProjectForm({
      title: '',
      description: '',
      category: '',
      status: '',
      externalLink: 'not-a-url',
      githubLink: '',
      liveDemoLink: 'ftp://example.com',
      imageUrl: 'bad-image',
      languages: '',
      tags: '',
    })

    expect(invalid).toMatchObject({
      title: 'Project title is required.',
      description: 'Project description is required.',
      category: 'Category is required.',
      status: 'Project status is required.',
      externalLink: 'External link must be a valid http or https URL.',
      githubLink: 'GitHub link is required.',
      liveDemoLink: 'Live link must be a valid http or https URL.',
      imageUrl: 'Image URL must be a valid http or https URL.',
      languages: 'Add at least one language.',
      tags: 'Add at least one tag.',
    })

    expect(validateProjectForm({
      title: 'Portfolio API',
      description: 'A project API.',
      category: 'Web Development',
      status: 'Completed',
      externalLink: 'https://example.com',
      githubLink: 'https://github.com/example/project',
      liveDemoLink: '',
      imageUrl: '',
      languages: 'JavaScript, Node.js',
      tags: 'api, portfolio',
    })).toEqual({})
  })
})
