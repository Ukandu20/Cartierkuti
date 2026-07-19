import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
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
    { name: 'Applied Analytics', issuer: 'Example Institute', year: '2025' },
  ],
  skills: {
    primary: ['Python', 'SQL'],
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
    expect(screen.getByText('Python')).toBeInTheDocument()
    expect(screen.getByText('Power BI')).toBeInTheDocument()
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
