import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Contact from './Contact'
import { renderWithProviders } from '@/test-utils'
import emailjs from '@emailjs/browser'

vi.mock('@emailjs/browser', () => ({ default: { sendForm: vi.fn() } }))

const fillForm = async (user, { name = 'Taylor', message = 'I would like to discuss an analytics project.' } = {}) => {
  await user.type(screen.getByLabelText(/^Name/), name)
  await user.type(screen.getByLabelText(/^Email/), 'taylor@example.com')
  await user.selectOptions(screen.getByRole('combobox', { name: 'Subject' }), 'Collaboration')
  await user.type(screen.getByLabelText(/^Message/), message)
}

describe('Contact form', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_EMAILJS_SERVICE_ID', 'test-service')
    vi.stubEnv('VITE_EMAILJS_TEMPLATE_ID', 'test-template')
    vi.stubEnv('VITE_EMAILJS_PUBLIC_KEY', 'test-key')
    emailjs.sendForm.mockReset()
  })
  afterEach(() => vi.unstubAllEnvs())

  it('includes the selected subject and trimmed text, then clears the form only on success', async () => {
    let submitted
    emailjs.sendForm.mockImplementation((_service, _template, form) => {
      submitted = Object.fromEntries(new FormData(form))
      return Promise.resolve({ status: 200 })
    })
    const user = userEvent.setup()
    renderWithProviders(<Contact />)
    await fillForm(user, { name: '  Taylor  ', message: '  Let us collaborate.  ' })
    await user.click(screen.getByRole('button', { name: 'Send message' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Message sent.')
    expect(submitted).toEqual({ user_name: 'Taylor', user_email: 'taylor@example.com', subject: 'Collaboration', message: 'Let us collaborate.' })
    expect(screen.getByLabelText(/^Name/)).toHaveValue('')
    expect(screen.getByLabelText(/^Message/)).toHaveValue('')
    expect(screen.getByRole('combobox', { name: 'Subject' })).toHaveValue('')
  })

  it('rejects whitespace-only required fields and focuses the first problem', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Contact />)
    await fillForm(user, { name: '   ', message: '   ' })
    await user.click(screen.getByRole('button', { name: 'Send message' }))
    expect(screen.getByText('Enter your name.')).toBeInTheDocument()
    expect(screen.getByText('Enter your message.')).toBeInTheDocument()
    expect(screen.getByLabelText(/^Name/)).toHaveFocus()
    expect(emailjs.sendForm).not.toHaveBeenCalled()
  })

  it('uses native validation to prevent invalid emails from being sent', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Contact />)
    await fillForm(user)
    await user.clear(screen.getByLabelText(/^Email/))
    await user.type(screen.getByLabelText(/^Email/), 'invalid-email')
    await user.click(screen.getByRole('button', { name: 'Send message' }))
    expect(screen.getByLabelText(/^Email/)).toBeInvalid()
    expect(emailjs.sendForm).not.toHaveBeenCalled()
  })

  it('retains a failed message and subject and lets the visitor retry', async () => {
    emailjs.sendForm.mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce({ status: 200 })
    const user = userEvent.setup()
    renderWithProviders(<Contact />)
    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Send message' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Your message is still here.')
    expect(screen.getByRole('link', { name: 'Email me directly' })).toHaveAttribute('href', 'mailto:okechiprest@gmail.com')
    expect(screen.getByLabelText(/^Message/)).toHaveValue('I would like to discuss an analytics project.')
    expect(screen.getByRole('combobox', { name: 'Subject' })).toHaveValue('Collaboration')
    await user.click(screen.getByRole('button', { name: 'Send message' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Message sent.')
    expect(emailjs.sendForm).toHaveBeenCalledTimes(2)
  })

  it('prevents duplicate sends and locks the submitted fields until the request finishes', async () => {
    let finish
    emailjs.sendForm.mockImplementation(() => new Promise(resolve => { finish = resolve }))
    const user = userEvent.setup()
    renderWithProviders(<Contact />)
    await fillForm(user)
    const form = screen.getByLabelText(/^Name/).closest('form')
    fireEvent.submit(form)
    fireEvent.submit(form)
    expect(emailjs.sendForm).toHaveBeenCalledTimes(1)
    expect(screen.getByLabelText(/^Message/)).toBeDisabled()
    expect(screen.getByRole('combobox', { name: 'Subject' })).toBeDisabled()
    finish({ status: 200 })
    await waitFor(() => expect(screen.getByLabelText(/^Message/)).not.toBeDisabled())
  })

  it('offers direct email and preserves the message when email delivery is not configured', async () => {
    vi.stubEnv('VITE_EMAILJS_PUBLIC_KEY', '')
    const user = userEvent.setup()
    renderWithProviders(<Contact />)
    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Send message' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('currently unavailable')
    expect(screen.getByLabelText(/^Message/)).toHaveValue('I would like to discuss an analytics project.')
    expect(emailjs.sendForm).not.toHaveBeenCalled()
  })
})
