import Project from '../models/project.model.js'
import { DEFAULT_CATEGORIES, listCategories, normalizeCategoryName } from './category.service.js'

const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const selectedOrder = { featured: -1, views: -1, _id: 1 }
export const publicProjectFilter = { visible: { $ne: false } }
const cardProjection = {
  category: 1, categorySlug: 1, title: 1, description: 1, methods: 1, tools: 1, languages: 1,
  status: 1, tags: 1, metadata: 1, externalLink: 1, githubLink: 1, liveDemoLink: 1,
  imageUrl: 1, featured: 1, views: 1, createdDate: 1, lastUpdatedDate: 1,
  avgStars: { $ifNull: [{ $round: [{ $avg: '$reviews.stars' }, 2] }, 0] },
  reviewCount: { $size: { $ifNull: ['$reviews', []] } },
}

export const listSelectedProjects = limit => Project.aggregate([
  { $match: publicProjectFilter },
  { $sort: selectedOrder }, { $limit: limit }, { $project: cardProjection },
])

export async function browseProjects({ page, limit, category, search, sort }) {
  const stored = await listCategories()
  const definitions = [...DEFAULT_CATEGORIES.filter(item => !stored.some(saved => saved.slug === item.slug)), ...stored]
  const aliases = item => [...new Set([item.name, item.slug, ...(item.aliases || []), ...(DEFAULT_CATEGORIES.find(defaultItem => defaultItem.slug === item.slug)?.aliases || [])].map(normalizeCategoryName))]
  const matches = []
  if (category && category !== 'all') {
    const definition = definitions.find(item => item.slug === category)
    const names = definition ? aliases(definition) : [category]
    matches.push({ $or: [
      { categorySlug: category },
      { categorySlug: { $in: ['', null] }, category: { $in: names.map(name => new RegExp(`^${escapeRegex(name)}$`, 'i')) } },
    ] })
  }
  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i')
    matches.push({ $or: ['title', 'description', 'category', 'status', 'tags', 'methods', 'tools', 'languages'].map(field => ({ [field]: pattern })) })
  }
  const filter = matches.length ? { $and: matches } : {}
  const order = sort === 'views' ? { views: -1, _id: 1 } : sort === 'title' ? { title: 1, _id: 1 } : { createdDate: -1, _id: 1 }
  const [result] = await Project.aggregate([{ $match: publicProjectFilter }, { $facet: {
    projects: [{ $match: filter }, { $sort: order }, { $skip: (page - 1) * limit }, { $limit: limit }, { $project: cardProjection }],
    matched: [{ $match: filter }, { $count: 'count' }],
    total: [{ $count: 'count' }],
    categories: [{ $group: { _id: { slug: '$categorySlug', name: '$category' }, count: { $sum: 1 } } }],
    featured: [{ $sort: selectedOrder }, { $limit: 1 }, { $project: cardProjection }],
  } }]).collation({ locale: 'en', strength: 2 })
  const categories = new Map()
  for (const group of result.categories) {
    const definition = group._id.slug ? definitions.find(item => item.slug === group._id.slug)
      : definitions.find(item => aliases(item).includes(normalizeCategoryName(group._id.name)))
    const slug = group._id.slug || definition?.slug || normalizeCategoryName(group._id.name) || 'uncategorized'
    const previous = categories.get(slug)
    categories.set(slug, { slug, name: definition?.name || group._id.name || 'Uncategorized', count: (previous?.count || 0) + group.count, order: definition?.order ?? 1000 })
  }
  return {
    projects: result.projects, total: result.matched[0]?.count || 0, totalProjects: result.total[0]?.count || 0,
    categories: [...categories.values()].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)),
    featuredProject: result.featured[0] || null, page, limit,
  }
}
