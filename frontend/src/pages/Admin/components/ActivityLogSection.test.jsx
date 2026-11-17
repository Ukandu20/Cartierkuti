import React from 'react'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test-utils'
import { useAdminActivities } from '../hooks/useAdminActivities'
import ActivityLogSection from './ActivityLogSection'
import apiClient from '@/utils/axiosConfig'

vi.mock('@/utils/axiosConfig', () => ({ default: { get: vi.fn() } }))
function Harness() {
  const state = useAdminActivities({ isAuth: true, pageSize: 2 })
  return <ActivityLogSection {...state} pageSize={2} pageCount={Math.ceil(state.totalActivities / 2)} />
}

describe('activity filters', () => {
  beforeEach(() => apiClient.get.mockReset())

  it('keeps edits as drafts and applies all filters in one page-one request', async () => {
    apiClient.get.mockResolvedValue({ data: { activities: [], total: 8 } })
    renderWithProviders(<Harness />)
    await waitFor(() => expect(apiClient.get).toHaveBeenCalledTimes(1))
    fireEvent.click(await screen.findByRole('button', { name: 'Page 3' }))
    await waitFor(() => expect(apiClient.get).toHaveBeenCalledTimes(2))
    fireEvent.click(screen.getByRole('button', { name: 'Filters' }))
    fireEvent.change(screen.getByLabelText('Filter activity type'), { target: { value: 'Updated' } })
    fireEvent.change(screen.getByLabelText('Activity start date'), { target: { value: '2026-01-01' } })
    fireEvent.change(screen.getByLabelText('Activity end date'), { target: { value: '2026-01-31' } })
    expect(apiClient.get).toHaveBeenCalledTimes(2)
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(apiClient.get).toHaveBeenCalledTimes(3))
    expect(apiClient.get.mock.lastCall[1].params).toEqual({ page: 1, limit: 2, type: 'Updated', startDate: '2026-01-01', endDate: '2026-01-31' })
    expect(screen.getByText('Type: Updated')).toBeInTheDocument()
  })

  it('shows loading and failed states without claiming that activity is empty', async () => {
    let reject
    apiClient.get.mockImplementationOnce(() => new Promise((_resolve, fail) => { reject = fail }))
      .mockResolvedValueOnce({ data: { activities: [], total: 0 } })
    renderWithProviders(<Harness />)
    expect(screen.getByText('Loading activity...')).toBeInTheDocument()
    expect(screen.queryByText('No activity yet.')).not.toBeInTheDocument()
    reject(new Error('Offline'))
    expect(await screen.findByRole('alert')).toHaveTextContent('Activity could not be loaded.')
    expect(screen.queryByText('No activity yet.')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Retry activity' }))
    expect(await screen.findByText('No activity yet.')).toBeInTheDocument()
  })

  it('prevents a reversed date range from reaching the API', async () => {
    apiClient.get.mockResolvedValue({ data: { activities: [], total: 0 } })
    renderWithProviders(<Harness />)
    await waitFor(() => expect(apiClient.get).toHaveBeenCalledTimes(1))
    fireEvent.click(screen.getByRole('button', { name: 'Filters' }))
    fireEvent.change(screen.getByLabelText('Activity start date'), { target: { value: '2026-02-01' } })
    fireEvent.change(screen.getByLabelText('Activity end date'), { target: { value: '2026-01-01' } })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(screen.getByRole('alert')).toHaveTextContent('end date must be on or after the start date')
    expect(apiClient.get).toHaveBeenCalledTimes(1)
  })
})
