import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import Footer from './Footer'
import { renderWithProviders } from '../../test-utils'
import apiClient from '@/utils/axiosConfig'
import { invalidateResumeCache } from '@/services/resumeService'

vi.mock('@/utils/axiosConfig', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
  },
}))

describe('Footer', () => {
  it('provides a structured site directory and accessible contact links', () => {
    invalidateResumeCache()
    renderWithProviders(<Footer />)

    const footer = screen.getByRole('contentinfo')
    expect(within(footer).getByText('Have a question worth measuring?')).toBeInTheDocument()
    expect(within(footer).getByRole('heading', { name: /let's turn it into something decision-ready/i })).toBeInTheDocument()
    expect(within(footer).getByRole('link', { name: 'Start a conversation' })).toHaveAttribute('href', '/contact')
    expect(within(footer).getByRole('navigation', { name: /footer navigation/i })).toBeInTheDocument()
    expect(within(footer).getByRole('link', { name: 'Portfolio' })).toHaveAttribute('href', '/portfolio')
    expect(within(footer).getByRole('link', { name: 'Résumé' })).toHaveAttribute('download')
    expect(within(footer).getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('rel', 'noopener noreferrer')
    expect(within(footer).getByRole('link', { name: 'GitHub' })).toHaveAttribute('rel', 'noopener noreferrer')
    expect(within(footer).getByText(/Preston Ukandu\. All rights reserved/i)).toBeInTheDocument()
  })

  it('uses the saved invitation in the shared footer', async () => {
    invalidateResumeCache()
    apiClient.get.mockResolvedValueOnce({ data: { homeContent: { ctaTitle: 'Let’s work together.' } } })
    renderWithProviders(<Footer />)
    expect(await screen.findByRole('heading', { name: 'Let’s work together.' })).toBeInTheDocument()
  })

  it('shows saved contact details and hides empty social links', async () => {
    invalidateResumeCache()
    apiClient.get.mockResolvedValueOnce({ data: { footerContent: { email: 'hello@example.com', github: '', title: 'Say hello.' } } })
    renderWithProviders(<Footer />)
    expect(await screen.findByRole('link', { name: 'hello@example.com' })).toHaveAttribute('href', 'mailto:hello@example.com')
    expect(screen.queryByRole('link', { name: 'GitHub' })).not.toBeInTheDocument()
  })

  it('renders arbitrary saved social links and respects an empty list', async () => {
    invalidateResumeCache()
    apiClient.get.mockResolvedValueOnce({ data: { footerContent: { socialLinks: [{ label: 'Mastodon', url: 'https://example.social/person' }] } } })
    const { unmount } = renderWithProviders(<Footer />)
    expect(await screen.findByRole('link', { name: 'Mastodon' })).toHaveAttribute('href', 'https://example.social/person')
    expect(screen.queryByRole('link', { name: 'GitHub' })).not.toBeInTheDocument()
    unmount()
    invalidateResumeCache()
    apiClient.get.mockResolvedValueOnce({ data: { footerContent: { socialLinks: [] } } })
    renderWithProviders(<Footer />)
    await screen.findByRole('link', { name: 'Start a conversation' })
    await vi.waitFor(() => expect(screen.queryByRole('link', { name: 'LinkedIn' })).not.toBeInTheDocument())
  })
})
