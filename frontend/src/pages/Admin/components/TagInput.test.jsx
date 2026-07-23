import React, { useState } from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../../test-utils'
import TagInput from './TagInput'

function ControlledTagInput() {
  const [value, setValue] = useState('')
  return (
    <TagInput
      value={value}
      onChange={setValue}
      placeholder="Add a tool"
      suggestions={['Python', 'Power BI']}
      maxItems={2}
    />
  )
}

function ControlledSkillInput() {
  const [value, setValue] = useState('Python\nSQL')
  return (
    <TagInput
      value={value}
      onChange={setValue}
      delimiter={'\n'}
      placeholder="Add a skill"
    />
  )
}

describe('TagInput', () => {
  it('uses canonical suggestion casing, rejects case-insensitive duplicates, and enforces the item limit', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ControlledTagInput />)

    const input = screen.getByLabelText('Add a tool')
    expect(input).toHaveAttribute('list')
    expect(document.querySelector('option[value="Python"]')).toBeInTheDocument()

    await user.type(input, 'python{Enter}')
    expect(screen.getByText('Python')).toBeInTheDocument()

    await user.type(input, 'PYTHON{Enter}Power BI{Enter}Tableau{Enter}')
    expect(screen.getAllByRole('button', { name: /^Remove / })).toHaveLength(2)
    expect(screen.getByText('Power BI')).toBeInTheDocument()
    expect(screen.queryByText('Tableau')).not.toBeInTheDocument()
  })

  it('keeps newline-delimited skill values as separate tags when adding comma-separated items', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ControlledSkillInput />)

    const input = screen.getByLabelText('Add a skill')
    expect(screen.getByText('Python')).toBeInTheDocument()
    expect(screen.getByText('SQL')).toBeInTheDocument()

    await user.type(input, 'Pandas, NumPy{Enter}')

    expect(screen.getByText('Pandas')).toBeInTheDocument()
    expect(screen.getByText('NumPy')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /^Remove / })).toHaveLength(4)
  })
})
