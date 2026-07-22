import { getCategoryLabel, normalizeCategoryValue } from '@/utils/projectCategories'

export const emptyProjectForm = {
  title: '',
  description: '',
  externalLink: '',
  githubLink: '',
  liveDemoLink: '',
  imageUrl: '',
  imageAssetId: '',
  category: '',
  categorySlug: '',
  methods: '',
  tools: '',
  status: '',
  tags: '',
  date: '',
  featured: false,
}

export const emptyProjectErrors = {}

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
  resumeFileUrl: '',
  resumeFileName: '',
  resumeFileUpdatedAt: '',
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
    metrics: safeArray(data.metrics).map((metric, index) => ({
      _editorId: metric?._editorId || `metric-${index}`,
      label: metric?.label || '',
      value: metric?.value || '',
      note: metric?.note || '',
    })),
    experience: safeArray(data.experience).map((item, index) => ({
      _editorId: item?._editorId || `experience-${index}`,
      role: item?.role || '',
      company: item?.company || '',
      location: item?.location || '',
      period: item?.period || '',
      bulletsText: safeArray(item?.bullets).join('\n'),
    })),
    education: safeArray(data.education).map((item, index) => ({
      _editorId: item?._editorId || `education-${index}`,
      school: item?.school || '',
      degree: item?.degree || '',
      period: item?.period || '',
      bulletsText: safeArray(item?.bullets).join('\n'),
    })),
    certifications: safeArray(data.certifications).map((item, index) => ({
      _editorId: item?._editorId || `certification-${index}`,
      name: item?.name || '',
      issuer: item?.issuer || '',
      year: item?.year || '',
    })),
    resumeFileUrl: data.resumeFileUrl || '',
    resumeFileName: data.resumeFileName || '',
    resumeFileUpdatedAt: data.resumeFileUpdatedAt || '',
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

export const validateResumeForm = (form) => {
  const errors = {}
  if (!form.headline?.trim()) errors.headline = 'Add the About page headline.'
  if (!form.summary?.trim()) errors.summary = 'Add the About page summary.'
  if (form.headline?.length > 120) errors.headline = 'Keep the headline to 120 characters or fewer.'
  if (form.summary?.length > 800) errors.summary = 'Keep the summary to 800 characters or fewer.'

  ;(form.metrics || []).forEach((item, index) => {
    if ((item.label || item.value || item.note) && !item.label?.trim()) errors[`metrics.${index}.label`] = `Metric ${index + 1} needs a label.`
    if ((item.label || item.value || item.note) && !item.value?.trim()) errors[`metrics.${index}.value`] = `Metric ${index + 1} needs a value.`
  })
  ;(form.experience || []).forEach((item, index) => {
    if ((item.role || item.company || item.period || item.bulletsText) && !item.role?.trim()) errors[`experience.${index}.role`] = `Experience ${index + 1} needs a role.`
    if ((item.role || item.company || item.period || item.bulletsText) && !item.company?.trim()) errors[`experience.${index}.company`] = `Experience ${index + 1} needs a company.`
  })
  ;(form.education || []).forEach((item, index) => {
    if ((item.school || item.degree || item.period || item.bulletsText) && !item.school?.trim()) errors[`education.${index}.school`] = `Education ${index + 1} needs a school.`
    if ((item.school || item.degree || item.period || item.bulletsText) && !item.degree?.trim()) errors[`education.${index}.degree`] = `Education ${index + 1} needs a degree.`
  })
  ;(form.certifications || []).forEach((item, index) => {
    if ((item.name || item.issuer || item.year) && !item.name?.trim()) errors[`certifications.${index}.name`] = `Certification ${index + 1} needs a name.`
    if ((item.name || item.issuer || item.year) && !item.issuer?.trim()) errors[`certifications.${index}.issuer`] = `Certification ${index + 1} needs an issuer.`
  })

  return errors
}

export const projectToFormData = (project = {}) => ({
  ...emptyProjectForm,
  title: project.title || '',
  description: project.description || '',
  externalLink: project.externalLink || '',
  githubLink: project.githubLink || '',
  liveDemoLink: project.liveDemoLink || '',
  imageUrl: project.imageUrl || '',
  imageAssetId: project.imageAssetId || '',
  category: project.categorySlug ? project.category : getCategoryLabel(project.category || project.categoryValue),
  categorySlug: project.categorySlug || normalizeCategoryValue(project.category || project.categoryValue),
  methods: (project.methods || []).join(', '),
  tools: (project.tools?.length ? project.tools : project.languages || []).join(', '),
  status: project.status || '',
  tags: (project.tags || []).join(', '),
  date: project.createdDate ? new Date(project.createdDate).toISOString().slice(0, 10) : '',
  featured: project.featured || false,
})

export const buildProjectPayload = (formData) => ({
  title: formData.title?.trim() || '',
  description: formData.description?.trim() || '',
  externalLink: formData.externalLink?.trim() || '',
  githubLink: formData.githubLink?.trim() || '',
  liveDemoLink: formData.liveDemoLink?.trim() || '',
  imageUrl: formData.imageUrl?.trim() || '',
  imageAssetId: formData.imageAssetId?.trim() || '',
  category: formData.category?.trim() || getCategoryLabel(formData.categorySlug),
  categorySlug: formData.categorySlug?.trim() || normalizeCategoryValue(formData.category),
  methods: splitCommaList(formData.methods),
  tools: splitCommaList(formData.tools),
  status: formData.status?.trim() || '',
  tags: formData.tags.split(',').map((item) => item.trim()).filter(Boolean),
  metadata: formData.metadata?.trim() || '',
  featured: Boolean(formData.featured),
})

const isValidUrl = (value) => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const splitCommaList = (value) =>
  (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

export const validateProjectForm = (formData) => {
  const errors = {}
  const requiredText = {
    title: 'Project title is required.',
    description: 'Project description is required.',
    category: 'Category is required.',
    status: 'Project status is required.',
  }

  Object.entries(requiredText).forEach(([key, message]) => {
    if (!formData[key]?.trim()) errors[key] = message
  })

  if (formData.title?.length > 90) errors.title = 'Project title must be 90 characters or fewer.'
  if (formData.description?.length > 500) errors.description = 'Project description must be 500 characters or fewer.'

  if (!formData.externalLink?.trim()) {
    errors.externalLink = 'External link is required.'
  } else if (!isValidUrl(formData.externalLink.trim())) {
    errors.externalLink = 'External link must be a valid http or https URL.'
  }

  if (!formData.githubLink?.trim()) {
    errors.githubLink = 'GitHub link is required.'
  } else if (!isValidUrl(formData.githubLink.trim())) {
    errors.githubLink = 'GitHub link must be a valid http or https URL.'
  }

  if (formData.liveDemoLink?.trim() && !isValidUrl(formData.liveDemoLink.trim())) {
    errors.liveDemoLink = 'Live link must be a valid http or https URL.'
  }

  if (formData.imageUrl?.trim() && !isValidUrl(formData.imageUrl.trim())) {
    errors.imageUrl = 'Image URL must be a valid http or https URL.'
  }

  if (!splitCommaList(formData.methods).length) {
    errors.methods = 'Add at least one method.'
  } else if (splitCommaList(formData.methods).length > 12) {
    errors.methods = 'Use no more than 12 methods.'
  }

  if (!splitCommaList(formData.tools).length) {
    errors.tools = 'Add at least one tool or technology.'
  } else if (splitCommaList(formData.tools).length > 20) {
    errors.tools = 'Use no more than 20 tools.'
  }

  if (!splitCommaList(formData.tags).length) {
    errors.tags = 'Add at least one tag.'
  } else if (splitCommaList(formData.tags).length > 8) {
    errors.tags = 'Use no more than 8 tags.'
  }

  return errors
}

export const projectWriteContractFields = Object.freeze([
  'category',
  'categorySlug',
  'description',
  'externalLink',
  'featured',
  'githubLink',
  'imageAssetId',
  'imageUrl',
  'liveDemoLink',
  'metadata',
  'methods',
  'status',
  'tags',
  'title',
  'tools',
])

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
  const normalizedFilter = normalizeCategoryValue(projectFilter)
  if (normalizedFilter !== 'all') {
    return projects.filter((project) => normalizeCategoryValue(project.categoryValue || project.category) === normalizedFilter)
  }
  return projects
}

export const getProjectFilterLabel = (projectFilter) => {
  if (projectFilter === 'active') return 'Active'
  if (projectFilter === 'featured') return 'Featured'
  return 'All'
}
