import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import Footer from './Footer'
import { renderWithProviders } from '../../test-utils'

vi.mock('@/utils/axiosConfig', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
  },
}))

describe('Footer', () => {
  it('provides a structured site directory and accessible contact links', () => {
    renderWithProviders(<Footer />)

    const footer = screen.getByRole('contentinfo')
    expect(within(footer).getByRole('heading', { name: /data science that makes the next decision clearer/i })).toBeInTheDocument()
    expect(within(footer).getByRole('navigation', { name: /footer navigation/i })).toBeInTheDocument()
    expect(within(footer).getByRole('link', { name: 'Portfolio' })).toHaveAttribute('href', '/portfolio')
    expect(within(footer).getByRole('link', { name: 'Résumé' })).toHaveAttribute('download')
    expect(within(footer).getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('rel', 'noopener noreferrer')
    expect(within(footer).getByRole('link', { name: 'GitHub' })).toHaveAttribute('rel', 'noopener noreferrer')
    expect(within(footer).getByText(/Preston Ukandu\. All rights reserved/i)).toBeInTheDocument()
  })
})
