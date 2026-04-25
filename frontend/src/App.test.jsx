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
    expect(screen.getByRole('heading', { name: /data analyst/i })).toBeInTheDocument()
  })

  it('renders the contact route', () => {
    renderWithProviders(<App />, { route: '/contact' })
    expect(screen.getByRole('heading', { name: /contact form/i })).toBeInTheDocument()
  })
})
