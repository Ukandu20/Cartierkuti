import React from 'react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
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
    apiGet.mockResolvedValue({
      data: [
        {
          _id: '1',
          title: 'Alias ML Project',
          category: 'Machine Learning/AI',
          createdDate: '2026-01-01',
          imageUrl: '/one.png',
          tags: [],
          reviews: [],
        },
        {
          _id: '2',
          title: 'Warehouse Dashboard',
          category: 'Data Analysis',
          createdDate: '2026-02-01',
          imageUrl: '/two.png',
          tags: [],
          reviews: [],
        },
      ],
    })
  })

  it('filters projects using normalized category aliases', async () => {
    renderWithProviders(<Portfolio />)

    expect((await screen.findAllByText('Alias ML Project')).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Warehouse Dashboard').length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('tab', { name: 'AI/ML' }))

    await waitFor(() => {
      expect(screen.getAllByText('Alias ML Project').length).toBeGreaterThan(0)
      expect(screen.queryAllByText('Warehouse Dashboard')).toHaveLength(0)
    })
  })

  it('shows an empty state when search has no matches', async () => {
    renderWithProviders(<Portfolio />)

    await screen.findAllByText('Alias ML Project')
    fireEvent.change(screen.getByPlaceholderText(/search projects/i), {
      target: { value: 'missing project' },
    })

    expect(await screen.findByText('No projects found.')).toBeInTheDocument()
  })
})
