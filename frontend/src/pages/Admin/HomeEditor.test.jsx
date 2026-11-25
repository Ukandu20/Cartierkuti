import React from 'react'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import HomeEditor from './HomeEditor'
import { renderWithProviders } from '../../test-utils'

const get = vi.fn()
const put = vi.fn()
vi.mock('@/utils/axiosConfig', () => ({ default: { get: (...args) => get(...args), put: (...args) => put(...args) } }))

it('loads, edits and saves Home text through the protected content endpoint', async () => {
  sessionStorage.setItem('isAdminAuthenticated', 'true')
  sessionStorage.setItem('loginTime', `${Date.now()}`)
  sessionStorage.setItem('adminToken', 'valid-token')
  get.mockImplementation(url => Promise.resolve({ data: url === '/api/resume/admin' ? { homeContent: { heroLead: 'Existing headline' } } : {} }))
  put.mockImplementation((_url, content) => Promise.resolve({ data: content }))
  renderWithProviders(<HomeEditor />)
  const heading = await screen.findByLabelText('Hero heading')
  expect(heading).toHaveValue('Existing headline')
  fireEvent.change(heading, { target: { value: 'A new headline' } })
  fireEvent.click(screen.getByRole('button', { name: 'Preview Home page' }))
  const preview = await screen.findByRole('dialog', { name: 'Home page preview' })
  expect(within(preview).getByRole('heading', { level: 1, name: /A new headline/ })).toBeInTheDocument()
  expect(put).not.toHaveBeenCalled()
  fireEvent.click(within(preview).getByRole('button', { name: 'Close preview' }))
  fireEvent.click(await screen.findByRole('button', { name: 'Save Home page' }))
  await waitFor(() => expect(put).toHaveBeenCalledWith('/api/resume/home-content', expect.objectContaining({ heroLead: 'A new headline' })))
  expect(await screen.findByRole('status')).toHaveTextContent('Home page saved.')
})
