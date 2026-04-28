import { expect, test } from '@playwright/test'

const baseProjects = () => [
  {
    _id: 'project-1',
    id: 'project-1',
    title: 'Alpha Analytics',
    description: 'Analytics dashboard for portfolio data.',
    category: 'Machine Learning/AI',
    languages: ['React', 'Python'],
    status: 'In Progress',
    tags: ['AI', 'Dashboard'],
    metadata: '',
    externalLink: 'https://example.com/alpha',
    githubLink: 'https://github.com/example/alpha',
    liveDemoLink: 'https://demo.example.com/alpha',
    imageUrl: 'https://picsum.photos/seed/alpha/640/420',
    featured: true,
    views: 42,
    reviews: [{ stars: 5, comment: 'Strong work' }],
    createdDate: '2026-01-15T00:00:00.000Z',
    lastUpdatedDate: '2026-01-20T00:00:00.000Z',
  },
  {
    _id: 'project-2',
    id: 'project-2',
    title: 'Beta Portfolio',
    description: 'Public website project.',
    category: 'Web Development',
    languages: ['React'],
    status: 'Completed',
    tags: ['Frontend'],
    metadata: '',
    externalLink: 'https://example.com/beta',
    githubLink: 'https://github.com/example/beta',
    liveDemoLink: '',
    imageUrl: 'https://picsum.photos/seed/beta/640/420',
    featured: false,
    views: 12,
    reviews: [{ stars: 4, comment: 'Useful' }],
    createdDate: '2026-01-10T00:00:00.000Z',
    lastUpdatedDate: '2026-01-11T00:00:00.000Z',
  },
]

const emptyResume = {
  headline: '',
  summary: '',
  location: '',
  email: '',
  phone: '',
  website: '',
  metrics: [],
  skills: [],
  experience: [],
  education: [],
  certifications: [],
}

const setupApi = async (page) => {
  const state = {
    projects: baseProjects(),
    projectWrites: [],
    loginAttempts: [],
  }

  await page.route('http://127.0.0.1:5050/api/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const method = request.method()
    const path = url.pathname

    if (path === '/api/admin/verify') {
      return route.fulfill({ status: 200, json: { ok: true } })
    }

    if (path === '/api/admin/login' && method === 'POST') {
      const body = request.postDataJSON()
      state.loginAttempts.push(body)
      if (body.username === 'admin' && body.password === 'valid-password') {
        return route.fulfill({ status: 200, json: { token: 'e2e-token' } })
      }
      return route.fulfill({ status: 401, json: { message: 'Invalid credentials' } })
    }

    if (path === '/api/projects' && method === 'GET') {
      return route.fulfill({ status: 200, json: state.projects })
    }

    if (path === '/api/projects' && method === 'POST') {
      const payload = request.postDataJSON()
      state.projectWrites.push(payload)
      const created = {
        ...payload,
        _id: `project-${state.projects.length + 1}`,
        id: `project-${state.projects.length + 1}`,
        views: 0,
        reviews: [],
        createdDate: '2026-02-01T00:00:00.000Z',
        lastUpdatedDate: '2026-02-01T00:00:00.000Z',
      }
      state.projects.unshift(created)
      return route.fulfill({ status: 201, json: created })
    }

    const projectMatch = path.match(/^\/api\/projects\/([^/]+)$/)
    if (projectMatch && method === 'PUT') {
      const id = projectMatch[1]
      const payload = request.postDataJSON()
      state.projectWrites.push(payload)
      const index = state.projects.findIndex((project) => project.id === id || project._id === id)
      const updated = {
        ...state.projects[index],
        ...payload,
        id,
        _id: id,
        lastUpdatedDate: '2026-02-02T00:00:00.000Z',
      }
      state.projects[index] = updated
      return route.fulfill({ status: 200, json: updated })
    }

    if (projectMatch && method === 'DELETE') {
      const id = projectMatch[1]
      state.projects = state.projects.filter((project) => project.id !== id && project._id !== id)
      return route.fulfill({ status: 200, json: { message: 'Deleted' } })
    }

    if (path.match(/^\/api\/projects\/([^/]+)\/hit$/) && method === 'PATCH') {
      return route.fulfill({ status: 200, json: { ok: true } })
    }

    if (path === '/api/activities' && method === 'GET') {
      return route.fulfill({ status: 200, json: { activities: [], total: 0 } })
    }

    if (path === '/api/activities' && method === 'POST') {
      return route.fulfill({ status: 201, json: { ok: true } })
    }

    if (path === '/api/resume') {
      return route.fulfill({ status: 200, json: emptyResume })
    }

    return route.fulfill({ status: 404, json: { message: `Unhandled ${method} ${path}` } })
  })

  return state
}

const login = async (page) => {
  await page.goto('/admin')
  await page.getByLabel('Username').fill('admin')
  await page.getByLabel('Password').fill('valid-password')
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page.getByText('Existing Projects')).toBeVisible()
}

const fillProjectForm = async (page, title) => {
  await page.getByLabel('Project Title').fill(title)
  await page.getByLabel('Project Description').fill(`${title} description`)
  await page.getByLabel('External Link').fill('https://example.com/project')
  await page.getByLabel('GitHub Link').fill('https://github.com/example/project')
  await page.getByLabel('Live Link').fill('https://demo.example.com/project')
  await page.locator('select[name="category"]').selectOption('Web Development')
  await page.getByLabel('Languages').fill('React, Node.js')
  await page.getByLabel('Tags').fill('Frontend, Portfolio')
  await page.locator('select[name="status"]').selectOption('Completed')
}

const clickNewProject = async (page) => {
  await page.getByRole('button', { name: 'New Project' }).first().click()
}

test.beforeEach(async ({ page }) => {
  await page.context().clearCookies()
  await page.addInitScript(() => window.sessionStorage.clear())
})

test('admin login succeeds and invalid login fails', async ({ page }) => {
  await setupApi(page)

  await page.goto('/admin')
  await page.getByLabel('Username').fill('admin')
  await page.getByLabel('Password').fill('bad-password')
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page.getByText('Wrong password').first()).toBeVisible()

  await page.locator('input[name="password"]').fill('valid-password')
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page.getByText('Existing Projects')).toBeVisible()
})

test('project form rejects invalid data before submit', async ({ page }) => {
  const api = await setupApi(page)
  await login(page)

  await clickNewProject(page)
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(page.getByText('Project title is required.')).toBeVisible()
  await expect(page.getByText('External link is required.')).toBeVisible()
  expect(api.projectWrites).toHaveLength(0)
})

test('create project sends the backend write contract payload', async ({ page }) => {
  const api = await setupApi(page)
  await login(page)

  await clickNewProject(page)
  await fillProjectForm(page, 'Gamma Launch')
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(page.getByText('Gamma Launch')).toBeVisible()
  expect(api.projectWrites[0]).toEqual({
    title: 'Gamma Launch',
    description: 'Gamma Launch description',
    category: 'Web Development',
    languages: ['React', 'Node.js'],
    status: 'Completed',
    tags: ['Frontend', 'Portfolio'],
    metadata: '',
    externalLink: 'https://example.com/project',
    githubLink: 'https://github.com/example/project',
    liveDemoLink: 'https://demo.example.com/project',
    imageUrl: '',
    featured: false,
  })
  expect(api.projectWrites[0]).not.toHaveProperty('date')
})

test('edit project updates displayed data', async ({ page }) => {
  const api = await setupApi(page)
  await login(page)

  const alphaRow = page.getByText('Alpha Analytics').locator('..').locator('..')
  await alphaRow.getByRole('button', { name: 'Edit' }).click()
  await page.getByLabel('Project Title').fill('Alpha Analytics Updated')
  await page.getByRole('button', { name: 'Update' }).click()

  await expect(page.getByText('Alpha Analytics Updated', { exact: true })).toBeVisible()
  expect(api.projectWrites.at(-1).title).toBe('Alpha Analytics Updated')
})

test('delete project removes it from the admin list', async ({ page }) => {
  await setupApi(page)
  await login(page)

  const betaRow = page.getByText('Beta Portfolio').locator('..').locator('..')
  await betaRow.getByRole('button', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Delete' }).last().click()

  await expect(page.getByText('Beta Portfolio')).toHaveCount(0)
})

test('portfolio category filtering supports AI aliases', async ({ page }) => {
  await setupApi(page)
  await page.goto('/portfolio')

  await page.getByRole('tab', { name: 'AI/ML' }).click({ force: true })
  await expect(page.getByText('Alpha Analytics').first()).toBeVisible()
  await expect(page.getByText('Beta Portfolio')).toHaveCount(0)
})

test('mobile project card actions are visible without hover', async ({ page }) => {
  await setupApi(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/portfolio')

  await expect(page.getByRole('button', { name: 'Demo' }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'GitHub' }).first()).toBeVisible()
})
