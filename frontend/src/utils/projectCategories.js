export const PROJECT_CATEGORIES = [
  { label: 'All', value: 'all', aliases: ['all'] },
  {
    label: 'Sports Analytics',
    value: 'sports-analytics',
    aliases: ['sports analytics', 'sport analytics'],
  },
  {
    label: 'Machine Learning & Forecasting',
    value: 'machine-learning-forecasting',
    aliases: [
      'machine learning & forecasting',
      'machine learning and forecasting',
      'machine learning/ai',
      'machine learning',
      'data science',
      'ai/ml',
      'ai',
      'ml',
    ],
  },
  {
    label: 'Data Analytics & BI',
    value: 'data-analytics-bi',
    aliases: ['data analytics & bi', 'data analytics and bi', 'data analytics', 'data analysis', 'business intelligence'],
  },
  {
    label: 'Data Systems & Pipelines',
    value: 'data-systems-pipelines',
    aliases: ['data systems & pipelines', 'data systems and pipelines', 'data engineering', 'data pipelines'],
  },
  {
    label: 'Web Applications',
    value: 'web-applications',
    aliases: ['web applications', 'web application', 'web development', 'software development'],
  },
]

export const categoryOptions = PROJECT_CATEGORIES.filter((category) => category.value !== 'all')

export const toCategoryOption = (category) => ({
  id: category.id || category._id,
  label: category.name || category.label,
  value: category.slug || category.value,
  aliases: category.aliases || [],
})

const categoryByAlias = PROJECT_CATEGORIES.reduce((acc, category) => {
  category.aliases.forEach((alias) => {
    acc[alias] = category
  })
  acc[category.value] = category
  acc[category.label.toLowerCase()] = category
  return acc
}, {})

export function normalizeCategoryValue(value) {
  const normalized = (value || '').toString().trim().toLowerCase()
  return categoryByAlias[normalized]?.value || normalized || 'uncategorized'
}

export function getCategoryLabel(value) {
  return PROJECT_CATEGORIES.find((category) => category.value === normalizeCategoryValue(value))?.label || 'Uncategorized'
}

export function isProjectInCategory(project, categoryValue) {
  const normalizedFilter = normalizeCategoryValue(categoryValue)
  if (normalizedFilter === 'all') return true
  if (project?.categorySlug) return project.categorySlug === categoryValue || project.categorySlug === normalizedFilter
  return normalizeCategoryValue(project?.categoryValue || project?.category) === normalizedFilter
}

export function getPopulatedProjectCategories(projects = [], categories = PROJECT_CATEGORIES) {
  const populated = new Set(projects.map((project) => project?.categorySlug || normalizeCategoryValue(project?.categoryValue || project?.category)))
  const options = categories.map(toCategoryOption)
  return [
    { label: 'All', value: 'all', aliases: ['all'] },
    ...options.filter((category) => category.value !== 'all' && populated.has(category.value)),
  ]
}
