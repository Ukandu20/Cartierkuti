import React from 'react'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../../test-utils'
import CategoryManagerDialog from './CategoryManagerDialog'

describe('CategoryManagerDialog', () => {
  it('adds, edits, and confirms deletion of categories', async () => {
    const onCreate = vi.fn().mockResolvedValue(true)
    const onUpdate = vi.fn().mockResolvedValue(true)
    const onDelete = vi.fn().mockResolvedValue(true)
    renderWithProviders(
      <CategoryManagerDialog
        open
        onOpenChange={vi.fn()}
        categories={[{ _id: 'category-1', name: 'Web Applications', slug: 'web-applications', aliases: [], order: 10 }]}
        loading={false}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />,
    )

    fireEvent.change(screen.getByLabelText('New category'), { target: { value: 'Decision Science' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ name: 'Decision Science' })))

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Web Platforms' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onUpdate).toHaveBeenCalledWith('category-1', expect.objectContaining({ name: 'Web Platforms' })))

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm delete' }))
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith('category-1'))
  })
})
