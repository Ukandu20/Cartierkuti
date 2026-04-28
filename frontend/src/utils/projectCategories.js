export const PROJECT_CATEGORIES = [
  { label: 'All', value: 'all', aliases: ['all'] },
  { label: 'Data Science', value: 'data-science', aliases: ['data science'] },
  { label: 'Data Analysis', value: 'data-analysis', aliases: ['data analysis'] },
  { label: 'Web Development', value: 'web-development', aliases: ['web development'] },
  {
    label: 'AI/ML',
    value: 'ai-ml',
    aliases: ['ai/ml', 'machine learning/ai', 'machine learning', 'ai', 'ml'],
  },
  { label: 'Others', value: 'others', aliases: ['others', 'other'] },
]

export const categoryOptions = PROJECT_CATEGORIES.filter((category) => category.value !== 'all')

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
  return categoryByAlias[normalized]?.value || normalized || 'others'
}

export function getCategoryLabel(value) {
  return PROJECT_CATEGORIES.find((category) => category.value === normalizeCategoryValue(value))?.label || 'Others'
}

export function isProjectInCategory(project, categoryValue) {
  const normalizedFilter = normalizeCategoryValue(categoryValue)
  if (normalizedFilter === 'all') return true
  return normalizeCategoryValue(project?.category) === normalizedFilter
}
