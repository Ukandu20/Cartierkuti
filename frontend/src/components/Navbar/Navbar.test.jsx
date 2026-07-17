import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import Navbar from './Navbar'
import { renderWithProviders } from '../../test-utils'

vi.mock('@/utils/axiosConfig', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({
      data: {
        resumeFileUrl: 'https://example.com/current-resume.pdf',
        resumeFileName: 'Preston-Resume.pdf',
      },
    })),
  },
}))

describe('Navbar', () => {
  it('renders valid navigation links and resolves the uploaded resume link', async () => {
    renderWithProviders(<Navbar />, { route: '/portfolio' })

    expect(screen.getByRole('link', { name: 'Home', hidden: true })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'About', hidden: true })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Portfolio', hidden: true })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Contact', hidden: true })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /skip to content/i })).toHaveAttribute('href', '#main-content')
    expect(screen.queryByRole('link', { name: /blog/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Résumé', hidden: true })).toHaveAttribute('href', '/resume.pdf')
    expect(screen.getByRole('link', { name: 'Résumé', hidden: true })).toHaveAttribute(
      'download',
      'Preston-Ukandu-Resume.pdf',
    )
    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Résumé', hidden: true })).toHaveAttribute(
        'href',
        '/api/resume/file/download',
      )
      expect(screen.getByRole('link', { name: 'Résumé', hidden: true })).toHaveAttribute(
        'download',
        'Preston-Resume.pdf',
      )
    })
  })

  it('opens an accessible mobile navigation drawer', async () => {
    renderWithProviders(<Navbar />)

    fireEvent.click(screen.getByRole('button', { name: /open navigation menu/i }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Navigation')).toBeInTheDocument()
    expect(within(dialog).getByRole('navigation', { name: /mobile navigation/i })).toBeInTheDocument()
    expect(within(dialog).getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page')
    expect(within(dialog).getByRole('link', { name: /download résumé/i })).toBeInTheDocument()
  })
})
