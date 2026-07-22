import Category from '../models/category.model.js'
import Project from '../models/project.model.js'

export const DEFAULT_CATEGORIES = [
  { name: 'Sports Analytics', slug: 'sports-analytics', aliases: ['sport analytics'], order: 10 },
  { name: 'Machine Learning & Forecasting', slug: 'machine-learning-forecasting', aliases: ['machine learning/ai', 'machine learning', 'data science', 'ai/ml', 'ai', 'ml'], order: 20 },
  { name: 'Data Analytics & BI', slug: 'data-analytics-bi', aliases: ['data analytics', 'data analysis', 'business intelligence'], order: 30 },
  { name: 'Data Systems & Pipelines', slug: 'data-systems-pipelines', aliases: ['data engineering', 'data pipelines'], order: 40 },
  { name: 'Web Applications', slug: 'web-applications', aliases: ['web application', 'web development', 'software development'], order: 50 },
]

export const normalizeCategoryName = (value) => String(value || '').trim().toLowerCase()
const RESERVED_CATEGORY_NAMES = new Set(['all', 'uncategorized'])

export const slugifyCategory = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')

const categoryPayload = ({ name, slug, aliases = [], order = 0, active = true }) => ({
  name: name.trim(),
  normalizedName: normalizeCategoryName(name),
  slug: slug || slugifyCategory(name),
  aliases: Array.from(new Set(aliases.map(normalizeCategoryName).filter(Boolean))),
  order,
  active,
})

export async function ensureDefaultCategories() {
  await Promise.all(DEFAULT_CATEGORIES.map((category) => Category.updateOne(
    { slug: category.slug },
    { $setOnInsert: categoryPayload(category) },
    { upsert: true },
  )))
}

export async function listCategories({ includeArchived = false } = {}) {
  await ensureDefaultCategories()
  return Category.find(includeArchived ? {} : { active: true }).sort({ order: 1, name: 1 }).lean()
}

export async function resolveCategory({ categorySlug, category }) {
  await ensureDefaultCategories()
  const name = normalizeCategoryName(category)
  const match = await Category.findOne({
    active: true,
    ...(categorySlug
      ? { slug: categorySlug }
      : { $or: [{ normalizedName: name }, { aliases: name }] }),
  }).lean()
  if (!match) throw Object.assign(new Error('Select an active category'), { status: 400 })
  return match
}

export async function createCategory(input) {
  const payload = categoryPayload(input)
  if (!payload.slug || RESERVED_CATEGORY_NAMES.has(payload.normalizedName)) {
    throw Object.assign(new Error('This category name is reserved'), { status: 400 })
  }
  const duplicate = await Category.findOne({
    $or: [{ slug: payload.slug }, { normalizedName: payload.normalizedName }],
  }).lean()
  if (duplicate) throw Object.assign(new Error('A category with this name already exists'), { status: 409 })
  return Category.create(payload)
}

export async function updateCategory(categoryId, input) {
  const existing = await Category.findById(categoryId)
  if (!existing) throw Object.assign(new Error('Category not found'), { status: 404 })
  const previousName = existing.name
  if (input.name !== undefined) {
    const normalizedName = normalizeCategoryName(input.name)
    if (RESERVED_CATEGORY_NAMES.has(normalizedName)) {
      throw Object.assign(new Error('This category name is reserved'), { status: 400 })
    }
    const duplicate = await Category.findOne({ normalizedName, _id: { $ne: existing._id } }).lean()
    if (duplicate) throw Object.assign(new Error('A category with this name already exists'), { status: 409 })
    existing.name = input.name.trim()
    existing.normalizedName = normalizedName
  }
  if (input.aliases !== undefined) existing.aliases = Array.from(new Set(input.aliases.map(normalizeCategoryName).filter(Boolean)))
  if (input.order !== undefined) existing.order = input.order
  await existing.save()
  if (existing.name !== previousName) {
    await Project.updateMany({ categorySlug: existing.slug }, { $set: { category: existing.name } })
  }
  return existing
}

export async function archiveCategory(categoryId) {
  const category = await Category.findById(categoryId)
  if (!category) throw Object.assign(new Error('Category not found'), { status: 404 })
  const projectsInUse = await Project.countDocuments({
    $or: [{ categorySlug: category.slug }, { category: category.name }],
  })
  if (projectsInUse) {
    throw Object.assign(new Error(`Reassign ${projectsInUse} project${projectsInUse === 1 ? '' : 's'} before deleting this category`), { status: 409 })
  }
  category.active = false
  category.archivedAt = new Date()
  await category.save()
}
