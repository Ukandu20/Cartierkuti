import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
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
    renderWithProviders(<Navbar />)

    expect(screen.getByRole('link', { name: /navigate to home/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /navigate to about/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /navigate to portfolio/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /navigate to contact/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /blog/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /download/i })).toHaveAttribute('href', '/resume.pdf')
    expect(screen.getByRole('link', { name: /download/i })).toHaveAttribute(
      'download',
      'Preston-Ukandu-Resume.pdf',
    )
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /download/i })).toHaveAttribute(
        'href',
        'http://localhost:5000/api/resume/file/download',
      )
      expect(screen.getByRole('link', { name: /download/i })).toHaveAttribute(
        'download',
        'Preston-Resume.pdf',
      )
    })
  })
})
