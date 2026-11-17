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
    apiGet.mockReset()
    apiPost.mockReset()
    apiGet.mockResolvedValue({ data: { reviews: [], total: 0, page: 1, limit: 20 } })
    apiPost.mockResolvedValue({
      data: {
        avgStars: 5, total: 1,
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
    const saved = vi.fn()
    renderWithProviders(
      <ProjectDetails
        project={{ _id: '507f1f77bcf86cd799439011', title: 'Project', tags: [] }}
        openLink={vi.fn()}
        handleFavorite={vi.fn()}
        isFavorite={false}
        onReviewSaved={saved}
      />,
    )

    await waitFor(() => expect(apiGet).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: '5 star' }))
    fireEvent.change(screen.getByPlaceholderText(/what did you think/i), {
      target: { value: '  Excellent project  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Submit review' }))

    await waitFor(() => {
      expect(apiPost).toHaveBeenCalledWith(
        '/api/projects/507f1f77bcf86cd799439011/reviews',
        { stars: 5, comment: 'Excellent project' },
      )
    })
    expect(await screen.findByText('Excellent project')).toBeInTheDocument()
    expect(saved).toHaveBeenCalledWith({ avgStars: 5, reviewCount: 1 })
    expect(screen.getByText('Showing 1 of 1 reviews')).toBeInTheDocument()
  })

  const details = (id = 'project-1') => <ProjectDetails project={{ _id: id, title: 'Project', tags: [] }} openLink={vi.fn()} handleFavorite={vi.fn()} isFavorite={false} />
  const review = id => ({ _id: String(id), stars: 4, comment: `Feedback ${id}` })

  it('loads older pages without replacing the existing reviews', async () => {
    apiGet.mockResolvedValueOnce({ data: { reviews: Array.from({ length: 20 }, (_, i) => review(i + 1)), total: 21 } })
      .mockResolvedValueOnce({ data: { reviews: [review(21)], total: 21 } })
    renderWithProviders(details())
    fireEvent.click(await screen.findByRole('button', { name: 'Load more reviews' }))
    expect(await screen.findByText('Feedback 21')).toBeInTheDocument()
    expect(screen.getByText('Feedback 1')).toBeInTheDocument()
    expect(screen.getByText('Showing 21 of 21 reviews')).toBeInTheDocument()
    expect(apiGet).toHaveBeenLastCalledWith('/api/projects/project-1/reviews', expect.objectContaining({ params: { page: 2, limit: 20 } }))
    expect(screen.queryByRole('button', { name: 'Load more reviews' })).not.toBeInTheDocument()
  })

  it('distinguishes a load failure from no reviews and retries the failed page', async () => {
    apiGet.mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce({ data: { reviews: [review(1)], total: 1 } })
    renderWithProviders(details())
    expect(await screen.findByRole('alert')).toHaveTextContent('Reviews could not be loaded')
    expect(screen.queryByText(/No reviews yet/)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Retry reviews' }))
    expect(await screen.findByText('Feedback 1')).toBeInTheDocument()
    expect(apiGet).toHaveBeenLastCalledWith('/api/projects/project-1/reviews', expect.objectContaining({ params: { page: 1, limit: 20 } }))
  })

  it('preserves loaded reviews when the next page fails and deduplicates a shifted page on retry', async () => {
    const first = Array.from({ length: 20 }, (_, i) => review(i + 1))
    apiGet.mockResolvedValueOnce({ data: { reviews: first, total: 21 } })
      .mockRejectedValueOnce(new Error('Offline'))
      .mockResolvedValueOnce({ data: { reviews: [review(20), review(21)], total: 21 } })
    renderWithProviders(details())
    fireEvent.click(await screen.findByRole('button', { name: 'Load more reviews' }))
    await screen.findByRole('alert')
    expect(screen.getByText('Feedback 1')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Retry reviews' }))
    expect(await screen.findByText('Feedback 21')).toBeInTheDocument()
    expect(screen.getAllByText('Feedback 20')).toHaveLength(1)
  })

  it('ignores a late response from a previously selected project', async () => {
    let resolveOld
    apiGet.mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve }))
      .mockResolvedValueOnce({ data: { reviews: [review('new')], total: 1 } })
    const Switcher = () => {
      const [id, setId] = React.useState('old-project')
      return <><button onClick={() => setId('new-project')}>Switch project</button>{details(id)}</>
    }
    renderWithProviders(<Switcher />)
    fireEvent.click(screen.getByRole('button', { name: 'Switch project' }))
    await screen.findByText('Feedback new')
    resolveOld({ data: { reviews: [review('old')], total: 1 } })
    await waitFor(() => expect(screen.queryByText('Feedback old')).not.toBeInTheDocument())
    expect(screen.getByText('Feedback new')).toBeInTheDocument()
  })
})
