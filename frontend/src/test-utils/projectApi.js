import { normalizeProjects } from '../utils/projectNormalizer'
import { getPopulatedProjectCategories, isProjectInCategory } from '../utils/projectCategories'
import { sortProjects } from '../utils/projectSorting'

// Fixtures for public-list consumers; database behavior is covered by API tests.
export function publicProjectFixture(projects, path, categories) {
  const url = new URL(path, 'http://fixture.test')
  const all = normalizeProjects(projects).map(({ reviews, ...project }) => project)
  const selected = [...all].sort((a, b) => Number(b.featured) - Number(a.featured) || (b.views || 0) - (a.views || 0))
  if (url.pathname.endsWith('/selected')) return selected.slice(0, Number(url.searchParams.get('limit') || 3))
  const search = (url.searchParams.get('search') || '').toLowerCase()
  const filtered = all.filter(project => isProjectInCategory(project, url.searchParams.get('category') || 'all') &&
    [project.title, project.description, project.category, project.status, ...(project.tools || []), ...(project.methods || []), ...(project.tags || [])].join(' ').toLowerCase().includes(search))
  const page = Number(url.searchParams.get('page') || 1)
  const limit = Number(url.searchParams.get('limit') || 9)
  return {
    projects: sortProjects(filtered, url.searchParams.get('sort') || 'date').slice((page - 1) * limit, page * limit),
    total: filtered.length, totalProjects: all.length, featuredProject: selected[0] || null,
    categories: getPopulatedProjectCategories(projects, categories).filter(item => item.value !== 'all').map(item => ({ slug: item.value, name: item.label })), page, limit,
  }
}
