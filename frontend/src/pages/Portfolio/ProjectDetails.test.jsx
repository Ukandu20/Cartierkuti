import React from 'react'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../test-utils'
import ProjectDetails from './ProjectDetails'

const apiGet = vi.fn()
const apiPost = vi.fn()

vi.mock('@/utils/axiosConfig', () => ({
  default: {
    get: (...args) => apiGet(...args),
    post: (...args) => apiPost(...args),
  },
}))

describe('ProjectDetails reviews', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    apiGet.mockResolvedValue({ data: { reviews: [], total: 0, page: 1, limit: 20 } })
    apiPost.mockResolvedValue({
      data: {
        review: {
          _id: 'review-1',
          stars: 5,
          comment: 'Excellent project',
          date: '2026-07-16T12:00:00.000Z',
        },
      },
    })
  })

  it('submits the strict API contract and renders only the persisted review', async () => {
    renderWithProviders(
      <ProjectDetails
        project={{ _id: '507f1f77bcf86cd799439011', title: 'Project', tags: [] }}
        openLink={vi.fn()}
        handleFavorite={vi.fn()}
        isFavorite={false}
      />,
    )

    await waitFor(() => expect(apiGet).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: '5 star' }))
    fireEvent.change(screen.getByPlaceholderText(/what did you think/i), {
      target: { value: '  Excellent project  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      expect(apiPost).toHaveBeenCalledWith(
        '/api/projects/507f1f77bcf86cd799439011/reviews',
        { stars: 5, comment: 'Excellent project' },
      )
    })
    expect(await screen.findByText('Excellent project')).toBeInTheDocument()
  })
})
