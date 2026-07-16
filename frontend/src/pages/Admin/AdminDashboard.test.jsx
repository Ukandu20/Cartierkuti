import React from 'react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import AdminDashboard from './AdminDashboard'
import AdminLoginPanel from './components/AdminLoginPanel'
import ProjectTableSection from './components/ProjectTableSection'
import { renderWithProviders } from '../../test-utils'

const apiGet = vi.fn()
const apiPost = vi.fn()
const localStore = {}

vi.mock('@/utils/axiosConfig', () => ({
  default: {
    get: (...args) => apiGet(...args),
    post: (...args) => apiPost(...args),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('Admin dashboard components', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    Object.keys(localStore).forEach((key) => delete localStore[key])
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key) => localStore[key] ?? null),
        setItem: vi.fn((key, value) => {
          localStore[key] = String(value)
        }),
        removeItem: vi.fn((key) => {
          delete localStore[key]
        }),
      },
      configurable: true,
    })
  })

  it('renders the login panel and submits credentials', () => {
    const handleLogin = vi.fn()
    const setUsername = vi.fn()
    const setPassword = vi.fn()

    renderWithProviders(
      <AdminLoginPanel
        username=""
        setUsername={setUsername}
        password=""
        setPassword={setPassword}
        handleLogin={handleLogin}
      />
    )

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText(/password/i, { selector: 'input' }), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    expect(setUsername).toHaveBeenCalledWith('admin')
    expect(setPassword).toHaveBeenCalledWith('secret')
    expect(handleLogin).toHaveBeenCalled()
  })

  it('restores an authenticated session and verifies the bearer token', async () => {
    sessionStorage.setItem('isAdminAuthenticated', 'true')
    sessionStorage.setItem('loginTime', `${Date.now()}`)
    sessionStorage.setItem('adminToken', 'valid-token')

    apiGet.mockImplementation((url) => {
      if (url === '/api/admin/verify') return Promise.resolve({ data: { valid: true } })
      if (url === '/api/projects') return Promise.resolve({ data: [] })
      if (url === '/api/resume') return Promise.resolve({ data: {} })
      if (url === '/api/activities') return Promise.resolve({ data: { activities: [], total: 0 } })
      return Promise.resolve({ data: {} })
    })

    renderWithProviders(<AdminDashboard />)

    await waitFor(() => {
      expect(apiGet).toHaveBeenCalledWith('/api/admin/verify', {
        headers: { Authorization: 'Bearer valid-token' },
      })
    })
    expect(await screen.findByText(/admin overview/i)).toBeInTheDocument()
  })

  it('renders project table rows with normalized id and featured state', () => {
    const project = {
      id: 'normalized-id',
      title: 'Portfolio API',
      category: 'Web Development',
      status: 'Completed',
      featured: true,
      views: 42,
      createdDate: '2025-01-01',
      lastUpdatedDate: '2025-03-14',
    }
    const onSearchChange = vi.fn()

    renderWithProviders(
      <ProjectTableSection
        projects={[project]}
        paginatedProjects={[project]}
        filteredProjectCount={1}
        projectPage={1}
        projectPageCount={1}
        projectPageSize={8}
        onProjectPageChange={vi.fn()}
        onOpenEdit={vi.fn()}
        onConfirmDelete={vi.fn()}
        onOpenAnalytics={vi.fn()}
        search=""
        onSearchChange={onSearchChange}
        statusFilter="all"
        onStatusFilterChange={vi.fn()}
        categoryFilter="all"
        onCategoryFilterChange={vi.fn()}
        onClearFilters={vi.fn()}
        dialogBg="bg.surface"
        dialogBorder="border.subtle"
      />
    )

    expect(screen.getAllByText('Portfolio API')).not.toHaveLength(0)
    expect(screen.getAllByText(/featured/i)).not.toHaveLength(0)
    expect(screen.getAllByText('42')).not.toHaveLength(0)
    expect(screen.getAllByText(/mar 14, 2025/i)).not.toHaveLength(0)
    expect(screen.getAllByRole('button', { name: /actions for portfolio api/i })).not.toHaveLength(0)

    fireEvent.change(screen.getByRole('textbox', { name: /search projects/i }), { target: { value: 'api' } })
    expect(onSearchChange).toHaveBeenCalledWith('api')
  })
})
