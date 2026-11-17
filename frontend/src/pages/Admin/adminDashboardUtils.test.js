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
  splitSkillItems,
  validateProjectForm,
  validateResumeForm,
} from './adminDashboardUtils'

describe('adminDashboardUtils', () => {
  it('keeps hidden projects hidden through editing and defaults older projects to public', () => {
    expect(projectToFormData({}).visible).toBe(true)
    const form = projectToFormData({ title: 'Hidden work', visible: false, featured: true })
    expect(buildProjectPayload(form)).toMatchObject({ visible: false, featured: true })
    expect(buildProjectPayload({ ...form, visible: true }).visible).toBe(true)
  })
  it('round-trips editable page text and intentionally empty working approaches', () => {
    const form = normalizeResumeForm({ pageContent: { heroTitle: 'My story', metaDescription: 'Research and learning.', principles: [], ctaDescription: '' } })
    expect(buildResumePayload(form).pageContent).toMatchObject({ heroTitle: 'My story', metaDescription: 'Research and learning.', principles: [], ctaDescription: '' })
  })
  it('round-trips separate program levels, personal cards, and gallery metadata', () => {
    const form = normalizeResumeForm({
      education: [{ school: 'University', program: 'Data Science', level: 'Master’s degree', status: 'In progress', visible: false }],
      personalItems: [{ title: 'French', category: 'Language', level: 'Beginner', status: 'Currently learning', notes: 'Conversation practice.', visible: true }],
      gallery: [{ title: 'Conference', imageUrl: 'https://example.com/photo.jpg', caption: 'A day of learning.', date: 'June 2026', location: 'Toronto', altText: 'Conference participants', featured: true }],
    })
    const payload = buildResumePayload(form)
    expect(payload.education[0]).toMatchObject({ program: 'Data Science', level: 'Master’s degree', status: 'In progress', visible: false })
    expect(payload.personalItems[0]).toMatchObject({ title: 'French', category: 'Language', level: 'Beginner' })
    expect(payload.gallery[0]).toMatchObject({ caption: 'A day of learning.', date: 'June 2026', location: 'Toronto', featured: true })
    expect(JSON.stringify(payload)).not.toContain('_editorId')
    expect(validateResumeForm({ ...form, headline: 'Analyst', summary: 'About me' })).toEqual({})
    expect(validateResumeForm({ ...form, headline: 'Analyst', summary: 'About me', gallery: [{ title: 'Photo', imageUrl: '', visible: true }] })).toHaveProperty('gallery.0.imageUrl')
  })

  it('normalizes and builds resume payloads', () => {
    const form = normalizeResumeForm({
      headline: ' Analyst ',
      summary: 'Summary',
      highlights: ['One', 'Two'],
      metrics: [{ label: ' Projects ', value: ' 12 ', note: ' shipped ' }],
      experience: [{ role: 'Dev', company: 'Acme', bullets: ['Built dashboards'] }],
      certifications: [{
        name: 'Applied Analytics',
        issuer: 'Example Institute',
        year: '2025',
        credentialId: ' AA-101 ',
        credentialUrl: ' https://credentials.example.com/AA-101 ',
        showCredentialLink: true,
      }],
      skills: { primary: ['SQL'], secondary: ['React'], tools: ['Git'] },
      resumeFileUrl: 'https://example.com/resume.pdf',
      resumeFileName: 'Preston-Resume.pdf',
      resumeFileUpdatedAt: '2026-04-30T10:00:00.000Z',
    })

    expect(form.highlightsText).toBe('One\nTwo')
    expect(form.resumeFileName).toBe('Preston-Resume.pdf')
    expect(form.certifications[0]).toMatchObject({
      credentialId: ' AA-101 ',
      credentialUrl: ' https://credentials.example.com/AA-101 ',
      showCredentialLink: true,
    })
    expect(buildResumePayload(form)).toMatchObject({
      headline: 'Analyst',
      highlights: ['One', 'Two'],
      metrics: [{ label: 'Projects', value: '12', note: 'shipped' }],
      certifications: [{
        name: 'Applied Analytics',
        issuer: 'Example Institute',
        year: '2025',
        credentialId: 'AA-101',
        credentialUrl: 'https://credentials.example.com/AA-101',
        showCredentialLink: true,
      }],
      skills: { primary: ['SQL'], secondary: ['React'], tools: ['Git'] },
    })
  })

  it('repairs highlights previously saved with literal newline separators without splitting commas', () => {
    const form = normalizeResumeForm({
      highlights: ['Dashboards, reporting\\nForecasting'],
      experience: [{ bullets: ['Built pipelines\\nAutomated reporting'] }],
      education: [{ bullets: ['Statistics\\nMachine learning'] }],
    })
    expect(form.highlightsText).toBe('Dashboards, reporting\nForecasting')
    expect(form.experience[0].bulletsText).toBe('Built pipelines\nAutomated reporting')
    expect(form.education[0].bulletsText).toBe('Statistics\nMachine learning')
    expect(buildResumePayload(form)).toMatchObject({
      highlights: ['Dashboards, reporting', 'Forecasting'],
    })
  })

  it('derives project forms, payloads, filters, counts, and analytics', () => {
    const projects = [
      { id: '1', title: 'A', status: 'In Progress', featured: true, views: 10, methods: ['API Design'], tools: ['JavaScript'], tags: ['Portfolio'], createdDate: '2025-01-01' },
      { id: '2', title: 'B', status: 'Completed', featured: false, views: 4, methods: ['Dashboard Design'], tools: ['SQL'], tags: ['Operations'], createdDate: '2025-02-01' },
    ]

    expect(projectToFormData(projects[0])).toMatchObject({
      title: 'A',
      methods: 'API Design',
      tools: 'JavaScript',
      tags: 'Portfolio',
      featured: true,
      date: '2025-01-01',
    })
    const payload = buildProjectPayload({
      ...projectToFormData(projects[0]),
      methods: 'API Design, Automated Testing',
      tools: 'JavaScript, Node.js',
      tags: 'Portfolio, Content Management',
      date: '2025-01-01',
    })
    expect(payload).toMatchObject({
      title: 'A',
      methods: ['API Design', 'Automated Testing'],
      tools: ['JavaScript', 'Node.js'],
      tags: ['Portfolio', 'Content Management'],
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
      methods: '',
      tools: '',
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
      methods: 'Add at least one method.',
      tools: 'Add at least one tool or technology.',
      tags: 'Add at least one tag.',
    })

    expect(validateProjectForm({
      title: 'Portfolio API',
      description: 'A project API.',
      category: 'Web Applications',
      status: 'Completed',
      externalLink: 'https://example.com',
      githubLink: 'https://github.com/example/project',
      liveDemoLink: '',
      imageUrl: '',
      methods: 'REST API Design, Automated Testing',
      tools: 'JavaScript, Node.js',
      tags: 'Portfolio, Content Management',
    })).toEqual({})
  })

  it('normalizes pasted and legacy multiline skills into separate items', () => {
    expect(splitSkillItems(['Python\nSQL', 'Pandas, NumPy', 'python', 'Git\\nDocker'])).toEqual([
      'Python',
      'SQL',
      'Pandas',
      'NumPy',
      'Git',
      'Docker',
    ])

    const form = normalizeResumeForm({
      skills: {
        primary: ['Python\nSQL\nPandas'],
        secondary: [],
        tools: ['Git\\nDocker'],
      },
    })

    expect(form.skillsPrimaryText).toBe('Python\nSQL\nPandas')
    expect(buildResumePayload({
      ...form,
      skillsPrimaryText: `${form.skillsPrimaryText}, NumPy`,
    }).skills.primary).toEqual(['Python', 'SQL', 'Pandas', 'NumPy'])
  })

  it('validates required About content and incomplete repeatable entries', () => {
    expect(validateResumeForm({
      headline: '',
      summary: '',
      metrics: [{ label: 'Focus', value: '', note: '' }],
      experience: [{ role: 'Analyst', company: '', period: '', bulletsText: '' }],
      education: [{ school: 'Windsor', degree: '', period: '', bulletsText: '' }],
      certifications: [{ name: 'Certificate', issuer: '', year: '2026' }],
    })).toMatchObject({
      headline: 'Add the About page headline.',
      summary: 'Add the About page summary.',
      'metrics.0.value': 'Metric 1 needs a value.',
      'experience.0.company': 'Experience 1 needs a company.',
      'education.0.program': 'Education 1 needs a program name.',
      'certifications.0.issuer': 'Certification 1 needs an issuer.',
    })
  })

  it('requires a valid credential URL only when a public credential link is configured', () => {
    const base = {
      headline: 'Analyst',
      summary: 'Summary',
      metrics: [],
      experience: [],
      education: [],
    }

    expect(validateResumeForm({
      ...base,
      certifications: [{
        name: 'Applied Analytics',
        issuer: 'Example Institute',
        credentialUrl: '',
        showCredentialLink: true,
      }],
    })).toMatchObject({
      'certifications.0.credentialUrl': 'Add a verification URL or disable the public credential link.',
    })

    expect(validateResumeForm({
      ...base,
      certifications: [{
        name: 'Applied Analytics',
        issuer: 'Example Institute',
        credentialUrl: 'javascript:alert(1)',
        showCredentialLink: false,
      }],
    })).toMatchObject({
      'certifications.0.credentialUrl': 'Credential URL must be a valid http or https URL.',
    })
  })
})
