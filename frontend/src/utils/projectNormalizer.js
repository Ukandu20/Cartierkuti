import { getCategoryLabel, normalizeCategoryValue } from './projectCategories'

export function normalizeProject(project = {}) {
  const id = project.id || project._id || ''
  const createdDate = project.createdDate || project.createdAt || project.date || null
  const lastUpdatedDate = project.lastUpdatedDate || project.updatedAt || createdDate
  const categoryValue = project.categorySlug || normalizeCategoryValue(project.category)
  const tools = project.tools?.length ? project.tools : project.languages || []

  return {
    ...project,
    _id: project._id || id,
    id,
    category: project.categorySlug ? project.category : getCategoryLabel(categoryValue),
    categorySlug: project.categorySlug || categoryValue,
    categoryValue,
    methods: Array.isArray(project.methods) ? project.methods : [],
    tools,
    tags: Array.isArray(project.tags) ? project.tags : [],
    featured: Boolean(project.featured ?? project.isFeatured),
    createdDate,
    lastUpdatedDate,
  }
}

export function normalizeProjects(projects) {
  return Array.isArray(projects) ? projects.map(normalizeProject) : []
}
