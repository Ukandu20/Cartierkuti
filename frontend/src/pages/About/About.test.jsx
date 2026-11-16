import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, within } from '@testing-library/react'
import About from './About'
import { renderWithProviders } from '../../test-utils'
import { getPublicResume } from '@/services/resumeService'
import { apiUrl } from '@/utils/apiConfig'

vi.mock('@/services/resumeService', () => ({
  getPublicResume: vi.fn(),
}))

const resume = {
  headline: 'Applied data scientist',
  summary: 'I build evidence-led tools for teams and decision makers.',
  highlights: ['Designed reliable experiments and communicated the results.'],
  metrics: [
    { label: 'Focus', value: 'Performance', note: 'Player and team context' },
    { label: 'Method', value: 'Evaluation', note: 'Honest model assessment' },
    { label: 'Output', value: 'Clarity', note: 'Useful analytical products' },
  ],
  experience: [
    {
      role: 'Data Scientist',
      company: 'Analytics Lab',
      location: 'Remote',
      period: '2024 - Present',
      bullets: ['Built a match outcome evaluation pipeline.'],
    },
  ],
  education: [
    {
      school: 'Example University',
      degree: 'B.Sc. Computer Science',
      period: '2020 - 2024',
      bullets: ['Studied statistics and software engineering.'],
    },
  ],
  certifications: [
    {
      name: 'Applied Analytics',
      issuer: 'Example Institute',
      year: '2025',
      credentialId: 'AA-2025-101',
      credentialUrl: 'https://credentials.example.com/AA-2025-101',
      showCredentialLink: true,
    },
  ],
  skills: {
    primary: ['Python\nSQL\nPandas'],
    secondary: ['Power BI'],
    tools: ['Git'],
  },
  resumeFileUrl: '/uploads/preston-resume.pdf',
  resumeFileName: 'preston-resume.pdf',
}

describe('About', () => {
  beforeEach(() => {
    getPublicResume.mockResolvedValue(resume)
  })

  it('omits the stored project-count metric while preserving other profile metrics', async () => {
    getPublicResume.mockResolvedValue({ ...resume, metrics: [...resume.metrics, { label: 'Projects', value: '5+', note: 'Completed projects' }] })
    renderWithProviders(<About />)
    expect(await screen.findByText('Performance')).toBeInTheDocument()
    expect(screen.queryByText('5+')).not.toBeInTheDocument()
    expect(screen.queryByText('Completed projects')).not.toBeInTheDocument()
  })

  it('shows highlight tags and places education and experience before metrics and working principles', async () => {
    renderWithProviders(<About />)
    const experience = await screen.findByRole('heading', { name: 'Data Scientist' })
    const education = screen.getByRole('heading', { name: 'B.Sc. Computer Science' })
    const introduction = screen.getByRole('group', { name: 'About summary' }).closest('section')
    expect(introduction).toContainElement(education)
    expect(screen.getAllByRole('heading', { name: 'B.Sc. Computer Science' })).toHaveLength(1)
    expect(screen.queryByText('Statistical analysis, predictive models, and evaluation grounded in the question at hand.')).not.toBeInTheDocument()
    const metrics = screen.getByText('Performance')
    expect(experience.compareDocumentPosition(metrics) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(education.compareDocumentPosition(screen.getByRole('heading', { name: 'Frame the question' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    for (const label of ['About highlights', 'Experience highlights', 'Education highlights']) {
      expect(within(screen.getByRole('list', { name: label })).getAllByRole('listitem')).toHaveLength(1)
    }
  })

  it('distinguishes programs and levels and displays only visible personal and gallery content', async () => {
    getPublicResume.mockResolvedValue({ ...resume,
      education: [
        { school: 'Example University', program: 'Data Science', level: 'Master’s degree', status: 'In progress' },
        { school: 'Private school', program: 'Private program', visible: false },
      ],
      personalItems: [
        { title: 'French', category: 'Language', level: 'Beginner', status: 'Currently learning', notes: 'Practising conversation.' },
        { title: 'Private learning plan', category: 'Learning', visible: false },
      ],
      gallery: [
        { title: 'Conference', imageUrl: 'https://example.com/conference.jpg', caption: 'Sharing analytical ideas.', altText: 'People at a conference', date: 'June 2026', location: 'Toronto' },
        { title: 'Private trip', imageUrl: 'https://example.com/private.jpg', visible: false },
      ],
    })
    renderWithProviders(<About />)
    expect(await screen.findByRole('heading', { name: 'Data Science' })).toBeInTheDocument()
    expect(screen.getByText('Master’s degree')).toBeInTheDocument()
    expect(screen.getByText('In progress')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'French' })).toBeInTheDocument()
    expect(screen.getByText('Beginner')).toBeInTheDocument()
    expect(screen.queryByText('Private program')).not.toBeInTheDocument()
    expect(screen.queryByText('Private learning plan')).not.toBeInTheDocument()
    expect(screen.queryByText('Private trip')).not.toBeInTheDocument()
    fireEvent.click(await screen.findByRole('button', { name: 'Open photo: Conference' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByRole('heading', { name: 'Conference' })).toBeInTheDocument()
    expect(within(dialog).getByAltText('People at a conference')).toBeInTheDocument()
  })

  it('hides empty optional sections instead of showing placeholder personal information', async () => {
    getPublicResume.mockResolvedValue({ ...resume, education: [], personalItems: [], gallery: [] })
    renderWithProviders(<About />)
    await screen.findByText('Applied data scientist')
    expect(screen.queryByText('Education', { exact: true })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Outside my work' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Experiences in pictures' })).not.toBeInTheDocument()
  })

  it('presents a clear analytics narrative and collaboration path', async () => {
    renderWithProviders(<About />)

    expect(screen.getByRole('heading', { name: /I make analytical work useful, explainable/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Frame the question' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Build and evaluate' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Make it useful' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Have a data problem or a sports analytics idea/i })).toBeInTheDocument()

    const contactLinks = screen.getAllByRole('link', { name: /Start a conversation/i })
    expect(contactLinks).toHaveLength(2)
    contactLinks.forEach((link) => expect(link).toHaveAttribute('href', '/contact'))

    expect(await screen.findByText('Performance')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Download résumé/i })).toHaveAttribute(
      'href',
      apiUrl('/api/resume/file/download')
    )
  })

  it('renders API-backed experience, education, credentials, and skills', async () => {
    renderWithProviders(<About />)

    expect(await screen.findByRole('heading', { name: 'Data Scientist' })).toBeInTheDocument()
    expect(screen.getByText('Analytics Lab · Remote')).toBeInTheDocument()
    expect(screen.getByText('Built a match outcome evaluation pipeline.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'B.Sc. Computer Science' })).toBeInTheDocument()
    expect(screen.getByText('Applied Analytics')).toBeInTheDocument()
    expect(screen.getByText('Credential ID: AA-2025-101')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /View credential/i })).toHaveAttribute(
      'href',
      'https://credentials.example.com/AA-2025-101',
    )
    expect(screen.getByRole('link', { name: /View credential/i })).toHaveAttribute('target', '_blank')
    expect(screen.getByText('Python')).toBeInTheDocument()
    expect(screen.getByText('SQL')).toBeInTheDocument()
    expect(screen.getByText('Pandas')).toBeInTheDocument()
    expect(screen.getByText('Power BI')).toBeInTheDocument()
  })

  it('hides the credential action when the admin toggle is disabled', async () => {
    getPublicResume.mockResolvedValueOnce({
      ...resume,
      certifications: [{ ...resume.certifications[0], showCredentialLink: false }],
    })

    renderWithProviders(<About />)

    expect(await screen.findByText('Credential ID: AA-2025-101')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /View credential/i })).not.toBeInTheDocument()
  })

  it('preserves paragraph breaks in the About summary', async () => {
    getPublicResume.mockResolvedValueOnce({
      ...resume,
      summary: 'I frame complex analytical questions clearly.\n\nI turn the evidence into useful decisions.',
    })

    renderWithProviders(<About />)

    const summary = await screen.findByRole('group', { name: 'About summary' })
    expect(summary.querySelectorAll('p')).toHaveLength(2)
    expect(summary).toHaveTextContent('I frame complex analytical questions clearly.')
    expect(summary).toHaveTextContent('I turn the evidence into useful decisions.')
  })
})
