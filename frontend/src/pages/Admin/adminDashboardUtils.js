export const emptyProjectForm = {
  title: '',
  description: '',
  externalLink: '',
  githubLink: '',
  liveDemoLink: '',
  imageUrl: '',
  category: '',
  languages: '',
  status: '',
  tags: '',
  date: '',
  featured: false,
}

export const emptyResumeForm = {
  headline: '',
  summary: '',
  highlightsText: '',
  metrics: [],
  experience: [],
  education: [],
  certifications: [],
  skillsPrimaryText: '',
  skillsSecondaryText: '',
  skillsToolsText: '',
}

export const splitLines = (value) =>
  (value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

export const normalizeStatus = (value) => (value || '').toString().trim().toLowerCase()

export const isInProgress = (value) => {
  const normalized = normalizeStatus(value)
  return normalized === 'in progress' || normalized === 'in-progress' || normalized === 'active'
}

export const isCompleted = (value) => normalizeStatus(value) === 'completed'

export const normalizeResumeForm = (data = {}) => {
  const safeArray = (value) => (Array.isArray(value) ? value : [])
  return {
    headline: data.headline || '',
    summary: data.summary || '',
    highlightsText: safeArray(data.highlights).join('\n'),
    metrics: safeArray(data.metrics).map((metric) => ({
      label: metric?.label || '',
      value: metric?.value || '',
      note: metric?.note || '',
    })),
    experience: safeArray(data.experience).map((item) => ({
      role: item?.role || '',
      company: item?.company || '',
      location: item?.location || '',
      period: item?.period || '',
      bulletsText: safeArray(item?.bullets).join('\n'),
    })),
    education: safeArray(data.education).map((item) => ({
      school: item?.school || '',
      degree: item?.degree || '',
      period: item?.period || '',
      bulletsText: safeArray(item?.bullets).join('\n'),
    })),
    certifications: safeArray(data.certifications).map((item) => ({
      name: item?.name || '',
      issuer: item?.issuer || '',
      year: item?.year || '',
    })),
    skillsPrimaryText: safeArray(data?.skills?.primary).join('\n'),
    skillsSecondaryText: safeArray(data?.skills?.secondary).join('\n'),
    skillsToolsText: safeArray(data?.skills?.tools).join('\n'),
  }
}

export const buildResumePayload = (form) => ({
  headline: form.headline?.trim() || '',
  summary: form.summary?.trim() || '',
  highlights: splitLines(form.highlightsText),
  metrics: (form.metrics || [])
    .filter((item) => item.label || item.value || item.note)
    .map((item) => ({
      label: item.label?.trim() || '',
      value: item.value?.trim() || '',
      note: item.note?.trim() || '',
    })),
  experience: (form.experience || [])
    .filter((item) => item.role || item.company || item.period || item.bulletsText)
    .map((item) => ({
      role: item.role?.trim() || '',
      company: item.company?.trim() || '',
      location: item.location?.trim() || '',
      period: item.period?.trim() || '',
      bullets: splitLines(item.bulletsText),
    })),
  education: (form.education || [])
    .filter((item) => item.school || item.degree || item.period || item.bulletsText)
    .map((item) => ({
      school: item.school?.trim() || '',
      degree: item.degree?.trim() || '',
      period: item.period?.trim() || '',
      bullets: splitLines(item.bulletsText),
    })),
  certifications: (form.certifications || [])
    .filter((item) => item.name || item.issuer || item.year)
    .map((item) => ({
      name: item.name?.trim() || '',
      issuer: item.issuer?.trim() || '',
      year: item.year?.trim() || '',
    })),
  skills: {
    primary: splitLines(form.skillsPrimaryText),
    secondary: splitLines(form.skillsSecondaryText),
    tools: splitLines(form.skillsToolsText),
  },
})

export const projectToFormData = (project = {}) => ({
  ...emptyProjectForm,
  title: project.title || '',
  description: project.description || '',
  externalLink: project.externalLink || '',
  githubLink: project.githubLink || '',
  liveDemoLink: project.liveDemoLink || '',
  imageUrl: project.imageUrl || '',
  category: project.category || '',
  languages: (project.languages || []).join(', '),
  status: project.status || '',
  tags: (project.tags || []).join(', '),
  date: project.createdDate ? new Date(project.createdDate).toISOString().slice(0, 10) : '',
  featured: project.featured || false,
})

export const buildProjectPayload = (formData) => ({
  ...formData,
  languages: formData.languages.split(',').map((item) => item.trim()).filter(Boolean),
  tags: formData.tags.split(',').map((item) => item.trim()).filter(Boolean),
})

export const getAvgStars = (project) => {
  if (!project) return 0
  if (typeof project.avgStars === 'number') return project.avgStars
  const reviews = Array.isArray(project.reviews) ? project.reviews : []
  if (!reviews.length) return 0
  const sum = reviews.reduce((acc, review) => acc + (review.stars || 0), 0)
  return Math.round((sum / reviews.length) * 10) / 10
}

export const getProjectCounts = (projects) => ({
  started: projects.filter((project) => isInProgress(project.status)).length,
  finished: projects.filter((project) => isCompleted(project.status)).length,
  total: projects.length,
})

export const getProjectAnalytics = (projects) => {
  const totalViews = projects.reduce((sum, project) => sum + (project.views || 0), 0)
  const avgViews = projects.length ? Math.round(totalViews / projects.length) : 0
  const featured = projects.filter((project) => project.featured).length
  const topViewed = [...projects]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5)

  return { totalViews, avgViews, featured, topViewed }
}

export const getFilteredProjects = (projects, projectFilter) => {
  if (projectFilter === 'active') return projects.filter((project) => isInProgress(project.status))
  if (projectFilter === 'featured') return projects.filter((project) => project.featured)
  return projects
}

export const getProjectFilterLabel = (projectFilter) => {
  if (projectFilter === 'active') return 'Active'
  if (projectFilter === 'featured') return 'Featured'
  return 'All'
}
