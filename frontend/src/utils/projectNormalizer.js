import { getCategoryLabel, normalizeCategoryValue } from './projectCategories'

export function normalizeProject(project = {}) {
  const id = project.id || project._id || ''
  const createdDate = project.createdDate || project.createdAt || project.date || null
  const lastUpdatedDate = project.lastUpdatedDate || project.updatedAt || createdDate
  const categoryValue = normalizeCategoryValue(project.category)

  return {
    ...project,
    _id: project._id || id,
    id,
    category: getCategoryLabel(categoryValue),
    categoryValue,
    featured: Boolean(project.featured ?? project.isFeatured),
    createdDate,
    lastUpdatedDate,
  }
}

export function normalizeProjects(projects) {
  return Array.isArray(projects) ? projects.map(normalizeProject) : []
}
