import React from 'react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import Portfolio from './Portfolio'
import { renderWithProviders } from '../../test-utils'

const apiGet = vi.fn()
const apiPatch = vi.fn()

vi.mock('@/utils/axiosConfig', () => ({
  default: {
    get: (...args) => apiGet(...args),
    patch: (...args) => apiPatch(...args),
  },
}))

describe('Portfolio', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    apiGet.mockImplementation((url) => {
      if (url.includes('/reviews')) return Promise.resolve({ data: { reviews: [] } })
      return Promise.resolve({ data: [
        {
          _id: '1',
          title: 'Alias ML Project',
          description: 'Evaluates useful machine-learning signals.',
          category: 'Machine Learning/AI',
          status: 'Completed',
          tools: ['Python', 'scikit-learn'],
          methods: ['Model Evaluation'],
          createdDate: '2026-01-01',
          imageUrl: '/one.png',
          externalLink: 'https://example.com/alias',
          githubLink: 'https://github.com/example/alias',
          featured: true,
          tags: ['Forecasting'],
          reviews: [],
        },
        {
          _id: '2',
          title: 'Warehouse Dashboard',
          description: 'Turns warehouse data into operational reporting.',
          category: 'Data Analysis',
          status: 'Completed',
          tools: ['SQL', 'Power BI'],
          methods: ['Dashboard Design'],
          createdDate: '2026-02-01',
          imageUrl: '/two.png',
          tags: [],
          reviews: [],
        },
      ] })
    })
  })

  it('filters projects using normalized category aliases', async () => {
    renderWithProviders(<Portfolio />)

    expect((await screen.findAllByText('Alias ML Project')).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Warehouse Dashboard').length).toBeGreaterThan(0)

    expect(screen.queryByRole('tab', { name: 'Sports Analytics' })).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'Data Systems & Pipelines' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('tab', { name: 'Machine Learning & Forecasting' }))

    await waitFor(() => {
      expect(screen.getAllByText('Alias ML Project').length).toBeGreaterThan(0)
      expect(screen.queryAllByText('Warehouse Dashboard')).toHaveLength(0)
    })
  }, 15000)

  it('shows an empty state when search has no matches', async () => {
    renderWithProviders(<Portfolio />)

    await screen.findAllByText('Alias ML Project')
    fireEvent.change(screen.getByRole('textbox', { name: /search projects/i }), {
      target: { value: 'missing project' },
    })

    expect(await screen.findByText('No projects match those filters.')).toBeInTheDocument()
  }, 15000)

  it('shows useful collapsed-card content and opens a case-study dialog from a dedicated action', async () => {
    renderWithProviders(<Portfolio />)

    expect(await screen.findByRole('heading', { name: /work built to move from evidence to action/i })).toBeInTheDocument()
    expect(screen.getAllByRole('article').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Evaluates useful machine-learning signals.').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Python').length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /live project/i }).length).toBeGreaterThan(0)

    fireEvent.click(screen.getAllByRole('button', { name: /view case study/i })[0])
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByRole('heading', { name: 'Alias ML Project' })).toBeInTheDocument()
    expect(within(dialog).getByRole('heading', { name: /the question, method, and delivery/i })).toBeInTheDocument()
    expect(within(dialog).getByText('Model Evaluation')).toBeInTheDocument()
    expect(within(dialog).getByText('Forecasting')).toBeInTheDocument()
  }, 15000)
})
