export function normalizeProject(project = {}) {
  const id = project.id || project._id || ''
  const createdDate = project.createdDate || project.createdAt || project.date || null
  const lastUpdatedDate = project.lastUpdatedDate || project.updatedAt || createdDate

  return {
    ...project,
    _id: project._id || id,
    id,
    featured: Boolean(project.featured ?? project.isFeatured),
    createdDate,
    lastUpdatedDate,
  }
}

export function normalizeProjects(projects) {
  return Array.isArray(projects) ? projects.map(normalizeProject) : []
}
