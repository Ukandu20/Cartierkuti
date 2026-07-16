import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import Home from './Home'
import { renderWithProviders } from '../../test-utils'

const apiGet = vi.fn()

vi.mock('@/utils/axiosConfig', () => ({
  default: {
    get: (...args) => apiGet(...args),
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
          ],
        })
      }
      return Promise.resolve({ data: {} })
    })
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

  it('renders API-backed selected work as an accessible project article', async () => {
    renderWithProviders(<Home />)

    expect(await screen.findByRole('heading', { name: 'Match Performance Model' })).toBeInTheDocument()
    expect(screen.getByRole('article')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /open project/i })).toHaveAttribute('href', 'https://example.com/model')
    expect(screen.getByRole('link', { name: /source/i })).toHaveAttribute('href', 'https://github.com/example/model')
  })
})
