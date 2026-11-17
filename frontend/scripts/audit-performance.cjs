// Reproducible JS/layout lab check. APIs and images are fixtures; fonts are blocked.
const fs = require('node:fs/promises')
const path = require('node:path')
const http = require('node:http')
const { gzipSync } = require('node:zlib')
const { chromium } = require('@playwright/test')

async function audit() {
  const root = path.resolve(__dirname, '../build')
  const assets = new Map()
  for (const name of await fs.readdir(path.join(root, 'assets'))) {
    const raw = await fs.readFile(path.join(root, 'assets', name))
    assets.set(name, { raw, gzip: gzipSync(raw) })
  }
  const server = http.createServer(async (req, res) => {
    try {
      const pathname = new URL(req.url, 'http://localhost').pathname
      const name = pathname.startsWith('/assets/') ? path.basename(pathname) : 'index.html'
      const asset = assets.get(name) || { gzip: gzipSync(await fs.readFile(path.join(root, name))) }
      const mime = { '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' }
      res.setHeader('content-type', mime[path.extname(name)] || 'text/html')
      res.setHeader('content-encoding', 'gzip')
      res.end(asset.gzip)
    } catch { res.writeHead(404); res.end() }
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  let browser
  const results = []
  try {
    browser = await chromium.launch({ headless: true })
    const origin = `http://127.0.0.1:${server.address().port}`
    for (const profile of ['desktop', 'mobile']) {
      for (const route of ['/', '/portfolio', '/about']) {
        const context = await browser.newContext({ viewport: profile === 'mobile' ? { width: 390, height: 844 } : { width: 1440, height: 900 } })
        const page = await context.newPage()
        const apiRequests = []
        await page.route('**/*', async intercepted => {
          const url = new URL(intercepted.request().url())
          if (url.pathname.startsWith('/api/')) {
            apiRequests.push(url.pathname)
            const projects = Array.from({ length: 20 }, (_, index) => ({
              _id: String(index + 1).padStart(24, '0'), title: `Project ${index + 1}`,
              description: 'Analytics project with reproducible data and decision-ready reporting.',
              category: 'Web Applications', categorySlug: 'web-applications', methods: ['Analysis'],
              tools: ['Python', 'React'], tags: ['Analytics'], status: 'Completed',
              externalLink: 'https://example.com', githubLink: 'https://github.com/example/project',
              imageUrl: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400"/>',
              featured: index === 0, views: index, reviews: [],
              createdDate: '2026-01-01T12:00:00Z', lastUpdatedDate: '2026-01-01T12:00:00Z',
            }))
            const json = url.pathname === '/api/projects/selected' ? projects.slice(0, 3)
              : url.pathname === '/api/projects/browse' ? { projects: projects.slice(0, 9), total: projects.length, totalProjects: projects.length, categories: [{ name: 'Web Applications', slug: 'web-applications' }], featuredProject: projects[0], page: 1, limit: 9 }
              : url.pathname === '/api/projects' ? projects
              : url.pathname === '/api/categories' ? [{ name: 'Web Applications', slug: 'web-applications' }]
              : url.pathname.endsWith('/reviews') ? { reviews: [], total: 0 }
              : { headline: 'Data science and analytics practitioner', summary: 'Evidence for useful decisions.', skills: { primary: [], secondary: [], tools: [] } }
            return intercepted.fulfill({ status: 200, json })
          }
          if (url.origin !== origin) return intercepted.abort()
          return intercepted.continue()
        })
        await page.addInitScript(() => {
          window.audit = { longTasks: [], lcp: 0, cls: 0 }
          new PerformanceObserver(list => list.getEntries().forEach(entry => window.audit.longTasks.push(entry.duration))).observe({ type: 'longtask', buffered: true })
          new PerformanceObserver(list => list.getEntries().forEach(entry => { window.audit.lcp = entry.startTime })).observe({ type: 'largest-contentful-paint', buffered: true })
          new PerformanceObserver(list => list.getEntries().forEach(entry => { if (!entry.hadRecentInput) window.audit.cls += entry.value })).observe({ type: 'layout-shift', buffered: true })
        })
        if (profile === 'mobile') {
          const cdp = await context.newCDPSession(page)
          await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
          await cdp.send('Network.enable')
          await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 200000, uploadThroughput: 93750 })
        }
        await page.goto(origin + route, { waitUntil: 'networkidle' })
        await page.locator(route === '/' ? '#hero-heading' : 'h1').waitFor()
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(1000)
        const metrics = await page.evaluate(() => ({ ...window.audit,
          fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
          scriptNames: performance.getEntriesByType('resource').filter(resource => resource.name.endsWith('.js')).map(resource => resource.name.split('/').pop()),
        }))
        const loaded = [...new Set(metrics.scriptNames)].map(name => assets.get(name)).filter(Boolean)
        results.push({ profile, route, fcpMs: metrics.fcp, lcpMs: metrics.lcp, cls: metrics.cls,
          blockingMs: metrics.longTasks.reduce((sum, duration) => sum + Math.max(0, duration - 50), 0),
          jsRawBytes: loaded.reduce((sum, asset) => sum + asset.raw.length, 0),
          jsGzipBytes: loaded.reduce((sum, asset) => sum + asset.gzip.length, 0), apiRequests,
        })
        await context.close()
      }
    }
    const report = { conditions: 'One cold run per route/profile; production build; instant mocked API with 20 projects; tiny inline images; external fonts blocked; gzip. Mobile: 4x CPU, 150ms latency, 1.6Mbps. Not Lighthouse or field data.', results }
    const output = path.resolve(__dirname, '../performance-results/audit.json')
    await fs.mkdir(path.dirname(output), { recursive: true })
    await fs.writeFile(output, JSON.stringify(report, null, 2))
    console.table(results.map(({ apiRequests, ...metrics }) => metrics))
    console.log(`Report: ${output}`)
  } finally {
    await browser?.close()
    await new Promise(resolve => server.close(resolve))
  }
}

audit().catch(error => { console.error(error); process.exitCode = 1 })
