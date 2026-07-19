import React from 'react'
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Home from './Home'
import { renderWithProviders } from '../../test-utils'

const apiGet = vi.fn()
const apiPatch = vi.fn()

vi.mock('@/utils/axiosConfig', () => ({
  default: {
    get: (...args) => apiGet(...args),
    patch: (...args) => apiPatch(...args),
  },
}))

describe('Home', () => {
  beforeEach(() => {
    apiGet.mockImplementation((url) => {
      if (url === '/api/projects') {
        return Promise.resolve({
          data: [
            {
              id: 'sports-model',
              title: 'Match Performance Model',
              description: 'A model for understanding team and player performance signals.',
              category: 'Sports Analytics',
              tags: ['Python', 'Modeling'],
              imageUrl: '/placeholder.svg',
              externalLink: 'https://example.com/model',
              githubLink: 'https://github.com/example/model',
              featured: true,
              views: 25,
            },
            {
              id: 'decision-dashboard',
              title: 'Decision Intelligence Dashboard',
              description: 'A dashboard that turns operational signals into decision-ready evidence.',
              category: 'Data Analysis',
              languages: ['SQL', 'Power BI'],
              imageUrl: '/placeholder.svg',
              externalLink: 'https://example.com/dashboard',
              githubLink: 'https://github.com/example/dashboard',
              featured: false,
              views: 18,
            },
          ],
        })
      }
      return Promise.resolve({ data: {} })
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('presents the data science and sports analytics role with clear actions', async () => {
    renderWithProviders(<Home />)

    expect(screen.getByText(/data science & sports analytics/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /turning complex data into clear decisions/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /view selected work/i })).toHaveAttribute('href', '/portfolio')
    expect(screen.getByRole('link', { name: /let's collaborate/i })).toHaveAttribute('href', '/contact')
    expect(screen.getByRole('heading', { name: /sports analytics/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /let's turn it into something decision-ready/i })).toBeInTheDocument()
  })

  it('renders selected work with the featured case-study card treatment', async () => {
    renderWithProviders(<Home />)

    expect(await screen.findByRole('heading', { name: 'Match Performance Model' })).toBeInTheDocument()
    const carousel = screen.getByRole('region', { name: 'Selected projects' })
    expect(within(carousel).getByRole('article')).toBeInTheDocument()
    expect(within(carousel).getByRole('button', { name: /view case study/i })).toBeInTheDocument()
    expect(within(carousel).getByRole('button', { name: /live project/i })).toBeInTheDocument()
    expect(within(carousel).getByRole('button', { name: /source/i })).toBeInTheDocument()
  })

  it('auto-advances the carousel and suspends autoplay while hovered', async () => {
    let autoplayCallback = null
    const autoplayId = 501

    vi.spyOn(window, 'setInterval').mockImplementation((callback, delay) => {
      if (delay === 5000) {
        autoplayCallback = callback
        return autoplayId
      }
      return 999
    })
    vi.spyOn(window, 'clearInterval').mockImplementation((id) => {
      if (id === autoplayId) autoplayCallback = null
    })

    renderWithProviders(<Home />)

    const carousel = await screen.findByRole('region', { name: 'Selected projects' })
    const slides = carousel.querySelectorAll('[aria-roledescription="slide"]')
    expect(slides).toHaveLength(2)
    expect(slides[0]).toHaveAttribute('aria-hidden', 'false')
    expect(slides[1]).toHaveAttribute('aria-hidden', 'true')

    await waitFor(() => expect(autoplayCallback).toEqual(expect.any(Function)))
    act(() => autoplayCallback())
    expect(slides[0]).toHaveAttribute('aria-hidden', 'true')
    expect(slides[1]).toHaveAttribute('aria-hidden', 'false')

    fireEvent.mouseEnter(carousel)
    await waitFor(() => expect(autoplayCallback).toBeNull())

    fireEvent.mouseLeave(carousel)
    await waitFor(() => expect(autoplayCallback).toEqual(expect.any(Function)))
  })
})
