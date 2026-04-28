import React from 'react'
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import Navbar from './Navbar'
import { renderWithProviders } from '../../test-utils'

describe('Navbar', () => {
  it('renders valid navigation links and omits the removed Blog link', () => {
    renderWithProviders(<Navbar />)

    expect(screen.getByRole('link', { name: /navigate to home/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /navigate to about/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /navigate to portfolio/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /navigate to contact/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /blog/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /download/i })).toHaveAttribute('href', '/resume.pdf')
  })
})
