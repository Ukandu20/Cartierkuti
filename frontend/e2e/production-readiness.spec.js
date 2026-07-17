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

  await page.route('**/api/**', async (route) => {
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
  await page.locator('input[name="password"]').fill('valid-password')
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible()
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

test('home page leads with data science and sports analytics work', async ({ page }) => {
  await setupApi(page)
  await page.goto('/')

  await expect(page.getByRole('heading', { name: /turning complex data into clear decisions/i })).toBeVisible()
  await expect(page.getByText(/data science & sports analytics/i)).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Alpha Analytics' })).toBeVisible()
  const carousel = page.getByRole('region', { name: 'Selected projects' })
  const slides = carousel.locator('[aria-roledescription="slide"]')
  await expect(slides).toHaveCount(2)
  await expect(slides.nth(0)).toHaveAttribute('aria-hidden', 'false')
  await expect(carousel.getByRole('button', { name: /view case study/i })).toBeVisible()

  await carousel.hover()
  await page.waitForTimeout(5_200)
  await expect(slides.nth(0)).toHaveAttribute('aria-hidden', 'false')

  await page.getByRole('heading', { name: /turning complex data into clear decisions/i }).hover()
  await page.waitForTimeout(5_200)
  await expect(slides.nth(1)).toHaveAttribute('aria-hidden', 'false')
  await expect(page.getByRole('link', { name: /view selected work/i })).toHaveAttribute('href', '/portfolio')
  await expect(page.getByRole('link', { name: /start a conversation/i })).toHaveAttribute('href', '/contact')
  await expect(page.locator('main')).toHaveCount(1)
})

test('shared navigation and footer adapt to the active viewport', async ({ page }) => {
  await setupApi(page)
  await page.goto('/about')

  await expect(page.getByRole('link', { name: /Preston Ukandu home/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /skip to content/i })).toHaveAttribute('href', '#main-content')
  await expect(page.locator('main footer')).toHaveCount(0)
  await expect(page.getByRole('contentinfo')).toBeVisible()
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Portfolio' })).toHaveAttribute('href', '/portfolio')

  if ((page.viewportSize()?.width || 0) >= 768) {
    const primaryNavigation = page.getByRole('navigation', { name: /primary navigation/i })
    await expect(primaryNavigation).toBeVisible()
    await expect(primaryNavigation.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page')
    const portfolioLink = primaryNavigation.getByRole('link', { name: 'Portfolio' })
    await portfolioLink.click()
    await expect(page).toHaveURL(/\/portfolio$/)
    expect(await portfolioLink.evaluate((link) => window.getComputedStyle(link).outlineStyle)).toBe('none')
  } else {
    await page.getByRole('button', { name: /open navigation menu/i }).click()
    const drawer = page.getByRole('dialog')
    await expect(drawer).toBeVisible()
    await expect(drawer.getByRole('navigation', { name: /mobile navigation/i })).toBeVisible()
    await expect(drawer.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page')
  }
})

test('about page headings keep readable spacing when text wraps', async ({ page }) => {
  await setupApi(page)
  await page.goto('/about')

  await expect(page.getByRole('heading', { name: /I make analytical work useful, explainable/i })).toBeVisible()

  const headingMetrics = await page.locator('main h1, main h2, main h3').evaluateAll((headings) =>
    headings.map((heading) => {
      const styles = window.getComputedStyle(heading)
      return {
        text: heading.textContent?.trim(),
        fontSize: Number.parseFloat(styles.fontSize),
        lineHeight: Number.parseFloat(styles.lineHeight),
        whiteSpace: styles.whiteSpace,
      }
    })
  )

  expect(headingMetrics.length).toBeGreaterThan(0)
  headingMetrics.forEach(({ text, fontSize, lineHeight, whiteSpace }) => {
    expect(lineHeight, `${text} needs enough line spacing`).toBeGreaterThanOrEqual(fontSize * 1.1)
    expect(whiteSpace, `${text} must wrap normally`).toBe('normal')
  })
})

test('admin login succeeds and invalid login fails', async ({ page }) => {
  await setupApi(page)

  await page.goto('/admin')
  await page.getByLabel('Username').fill('admin')
  await page.locator('input[name="password"]').fill('bad-password')
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page.getByText('Wrong password').first()).toBeVisible()

  await page.locator('input[name="password"]').fill('valid-password')
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible()
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

test('project editor warns before discarding unsaved changes', async ({ page }) => {
  await setupApi(page)
  await login(page)
  await clickNewProject(page)
  await page.getByLabel('Project Title').fill('Unsaved project')

  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('Discard your unsaved project changes?')
    await dialog.dismiss()
  })
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(page.getByRole('heading', { name: 'New Project' })).toBeVisible()

  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(page.getByRole('heading', { name: 'New Project' })).toHaveCount(0)
})

test('create project sends the backend write contract payload', async ({ page }) => {
  const api = await setupApi(page)
  await login(page)

  await clickNewProject(page)
  await fillProjectForm(page, 'Gamma Launch')
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(page.getByText('Gamma Launch').filter({ visible: true })).toBeVisible()
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

  await page.getByRole('button', { name: 'Actions for Alpha Analytics' }).click()
  await page.getByRole('menuitem', { name: 'Edit' }).click()
  await page.getByLabel('Project Title').fill('Alpha Analytics Updated')
  await page.getByRole('button', { name: 'Update' }).click()

  await expect(page.getByText('Alpha Analytics Updated', { exact: true }).filter({ visible: true })).toBeVisible()
  expect(api.projectWrites.at(-1).title).toBe('Alpha Analytics Updated')
})

test('delete project removes it from the admin list', async ({ page }) => {
  await setupApi(page)
  await login(page)

  await page.getByRole('button', { name: 'Actions for Beta Portfolio' }).click()
  await page.getByRole('menuitem', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Delete' }).last().click()

  await expect(page.getByText('Beta Portfolio')).toHaveCount(0)
})

test('admin project search and status filters narrow the management view', async ({ page }) => {
  await setupApi(page)
  await login(page)
  const projectsSection = page.locator('[aria-labelledby="admin-projects-heading"]')

  await page.getByLabel('Search projects').fill('Beta')
  await expect(projectsSection.getByText('Beta Portfolio').filter({ visible: true })).toBeVisible()
  await expect(projectsSection.getByText('Alpha Analytics')).toHaveCount(0)

  await page.getByLabel('Search projects').fill('')
  await page.getByLabel('Filter by status').selectOption('In Progress')
  await expect(projectsSection.getByText('Alpha Analytics').filter({ visible: true })).toBeVisible()
  await expect(projectsSection.getByText('Beta Portfolio')).toHaveCount(0)
})

test('portfolio category filtering supports AI aliases', async ({ page }) => {
  await setupApi(page)
  await page.goto('/portfolio')

  await page.getByRole('tab', { name: 'AI/ML' }).click({ force: true })
  await expect(page.getByText('Alpha Analytics').first()).toBeVisible()
  await expect(page.getByText('Beta Portfolio')).toHaveCount(0)
})

test('portfolio cards open a structured case-study view', async ({ page }) => {
  await setupApi(page)
  await page.goto('/portfolio')

  const firstCard = page.getByRole('article').first()
  await expect(firstCard.getByText('Analytics dashboard for portfolio data.')).toBeVisible()
  await expect(firstCard.getByText('React')).toBeVisible()
  await firstCard.getByRole('button', { name: /view case study/i }).click()

  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: 'Alpha Analytics' })).toBeVisible()
  await expect(dialog.getByRole('heading', { name: /the question, method, and delivery/i })).toBeVisible()
  await expect(dialog.getByText('Project overview')).toBeVisible()
  await expect(dialog.getByText('Approach and delivery')).toBeVisible()
})

test('mobile project card actions are visible without hover', async ({ page }) => {
  await setupApi(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/portfolio')

  await expect(page.getByRole('button', { name: /view case study/i }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: /live project/i }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: /source/i }).first()).toBeVisible()
})

test('shared theme tokens drive contact controls in light and dark modes', async ({ page }) => {
  await setupApi(page)
  await page.goto('/contact')

  const pageHeading = page.getByRole('heading', { name: /make the next decision clearer/i })
  const submitButton = page.getByRole('button', { name: /send message/i })
  await expect(pageHeading).toBeVisible()
  await expect(submitButton).toBeVisible()

  const lightTheme = await page.evaluate(() => ({
    bodyFont: getComputedStyle(document.body).fontFamily,
    headingFont: getComputedStyle(document.querySelector('h1')).fontFamily,
    canvas: getComputedStyle(document.body).backgroundColor,
    button: getComputedStyle(document.querySelector('button[type="submit"]')).backgroundColor,
    hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }))
  expect(lightTheme.bodyFont).toContain('Source Sans 3')
  expect(lightTheme.headingFont).toContain('Playfair Display')
  expect(lightTheme.canvas).toBe('rgb(246, 244, 241)')
  expect(lightTheme.button).toBe('rgb(15, 118, 110)')
  expect(lightTheme.hasHorizontalOverflow).toBe(false)

  await page.getByRole('button', { name: /toggle light or dark mode/i }).first().click()
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(20, 20, 20)')
  await expect.poll(() => submitButton.evaluate((button) => getComputedStyle(button).backgroundColor)).toBe('rgb(94, 234, 212)')
})

test('not-found state uses the shared responsive surface', async ({ page }) => {
  await setupApi(page)
  await page.goto('/missing-page')

  await expect(page.getByRole('heading', { name: /this page has left the dataset/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /return home/i })).toHaveAttribute('href', '/')
  await expect(page.getByRole('link', { name: /view portfolio/i })).toHaveAttribute('href', '/portfolio')
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false)
})
