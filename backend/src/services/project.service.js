import crypto from 'crypto'
import Project from '../models/project.model.js'
import ArchivedProject from '../models/archive.model.js'
import Activity from '../models/activity.model.js'
import logger from '../logger.js'
import { resolveCategory } from './category.service.js'
import { destroyProjectImage } from './project-image.service.js'

const notFound = () => Object.assign(new Error('Project not found'), { status: 404 })
const conflict = () => Object.assign(new Error('Project changed during this operation. Reload and try again.'), { status: 409 })
const revisionFilter = (project) => project.mutationId
  ? { mutationId: project.mutationId }
  : { mutationId: { $in: ['', null] } }

export async function createProject(payload, actor = 'system') {
  const category = await resolveCategory(payload)
  const project = await Project.create({
    ...payload,
    category: category.name,
    categorySlug: category.slug,
  })

  try {
    await Activity.create({
      projectId: project._id,
      type: 'Created',
      title: project.title,
      detail: `Project "${project.title}" was created.`,
      actor,
    })
  } catch (error) {
    const rollback = await Project.deleteOne({
      _id: project._id,
      ...revisionFilter(project),
      lastUpdatedDate: project.lastUpdatedDate,
      __v: project.__v,
      views: project.views,
    }).catch((rollbackError) => {
      logger.error({ rollbackError, projectId: project._id }, 'Could not roll back project creation')
    })
    if (rollback?.deletedCount === 1) await destroyProjectImage(project.imageAssetId)
    throw error
  }

  return project
}

export async function updateProject(projectId, payload, actor = 'system') {
  const previous = await Project.findById(projectId).select('+mutationId').lean()
  if (!previous) throw notFound()

  let resolvedPayload = payload
  if (payload.category !== undefined || payload.categorySlug !== undefined) {
    const category = await resolveCategory(payload)
    resolvedPayload = { ...payload, category: category.name, categorySlug: category.slug }
  }

  const mutationId = crypto.randomUUID()
  const project = await Project.findOneAndUpdate({ _id: projectId, ...revisionFilter(previous) }, {
    $set: { ...resolvedPayload, mutationId },
  }, {
    new: true,
    runValidators: true,
  })
  if (!project) throw conflict()

  try {
    await Activity.create({
      projectId: project._id,
      type: 'Updated',
      title: project.title,
      detail: `Changed: ${Object.keys(resolvedPayload).join(', ')}`,
      actor,
    })
  } catch (error) {
    // Restore only our fields, and only while this is still the latest admin edit.
    // Public counters/reviews can change independently while the audit write runs.
    const restore = { mutationId: crypto.randomUUID() }
    const unset = {}
    for (const field of Object.keys(resolvedPayload)) {
      if (previous[field] === undefined) unset[field] = ''
      else restore[field] = previous[field]
    }
    const rollback = await Project.updateOne(
      { _id: projectId, mutationId },
      { $set: restore, ...(Object.keys(unset).length ? { $unset: unset } : {}) },
    ).catch((rollbackError) => {
      logger.error({ rollbackError, projectId }, 'Could not roll back project update')
    })
    if (rollback?.matchedCount === 0) {
      logger.warn({ projectId }, 'Skipped project rollback because a newer edit or deletion exists')
    }
    throw error
  }

  if (previous.imageAssetId && previous.imageAssetId !== project.imageAssetId) {
    await destroyProjectImage(previous.imageAssetId)
  }

  return project
}

export async function archiveAndDeleteProject(projectId, actor = 'system') {
  const project = await Project.findById(projectId).select('+mutationId').lean()
  if (!project) throw notFound()

  const { _id: originalId, ...snapshot } = project
  let archive
  let deleted = false

  try {
    archive = await ArchivedProject.create({
      originalId,
      ...snapshot,
      deletedAt: new Date(),
      deletedBy: actor,
    })
    const result = await Project.deleteOne({
      _id: originalId,
      ...revisionFilter(project),
      lastUpdatedDate: project.lastUpdatedDate,
      __v: project.__v,
      views: project.views,
    })
    if (result.deletedCount !== 1) throw conflict()
    deleted = true
    await Activity.create({
      projectId: originalId,
      type: 'Deleted',
      title: project.title,
      detail: `Project "${project.title}" was archived and deleted.`,
      actor,
    })
    await destroyProjectImage(project.imageAssetId)
  } catch (error) {
    if (deleted) {
      // Insert rather than replace: never overwrite a document restored concurrently.
      await Project.create(project).catch((rollbackError) => {
        logger.error({ rollbackError, projectId }, 'Could not restore project after delete failure')
      })
    }
    if (archive?._id) {
      await ArchivedProject.deleteOne({ _id: archive._id }).catch((rollbackError) => {
        logger.error({ rollbackError, projectId }, 'Could not remove archive after delete failure')
      })
    }
    throw error
  }
}
