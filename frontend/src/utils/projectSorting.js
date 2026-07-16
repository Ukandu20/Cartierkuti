export function sortProjects(projects, sort) {
  return [...projects].sort((a, b) => {
    if (sort === 'date') {
      return new Date(b.createdDate || 0) - new Date(a.createdDate || 0)
    }
    if (sort === 'views') return (b.views ?? 0) - (a.views ?? 0)
    return a.title.localeCompare(b.title)
  })
}
