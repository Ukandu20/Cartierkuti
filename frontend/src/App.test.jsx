import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import App from './App'
import { renderWithProviders } from './test-utils'

vi.mock('@/utils/axiosConfig', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    patch: vi.fn(() => Promise.resolve({ data: {} })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
  },
}))

describe('App routes', () => {
  it('renders the home route', async () => {
    renderWithProviders(<App />)
    expect(await screen.findByRole('link', { name: /Preston Ukandu home/i })).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: /turning complex data into clear decisions/i }, { timeout: 10000 })
    ).toBeInTheDocument()
    expect(document.querySelectorAll('main')).toHaveLength(1)
    expect(document.querySelector('main footer')).toBeNull()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  }, 15000)

  it('renders the contact route', async () => {
    renderWithProviders(<App />, { route: '/contact' })
    expect(
      await screen.findByRole('heading', { name: /tell me what you are exploring/i }, { timeout: 10000 })
    ).toBeInTheDocument()
  }, 10000)
})
