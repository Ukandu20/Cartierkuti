import Project from '../models/project.model.js'
import ArchivedProject from '../models/archive.model.js'
import Activity from '../models/activity.model.js'
import logger from '../logger.js'

const notFound = () => Object.assign(new Error('Project not found'), { status: 404 })

export async function createProject(payload, actor = 'system') {
  const project = await Project.create(payload)

  try {
    await Activity.create({
      projectId: project._id,
      type: 'Created',
      title: project.title,
      detail: `Project "${project.title}" was created.`,
      actor,
    })
  } catch (error) {
    await Project.deleteOne({ _id: project._id }).catch((rollbackError) => {
      logger.error({ rollbackError, projectId: project._id }, 'Could not roll back project creation')
    })
    throw error
  }

  return project
}

export async function updateProject(projectId, payload, actor = 'system') {
  const previous = await Project.findById(projectId).lean()
  if (!previous) throw notFound()

  const project = await Project.findByIdAndUpdate(projectId, payload, {
    new: true,
    runValidators: true,
  })

  try {
    await Activity.create({
      projectId: project._id,
      type: 'Updated',
      title: project.title,
      detail: `Changed: ${Object.keys(payload).join(', ')}`,
      actor,
    })
  } catch (error) {
    await Project.replaceOne({ _id: projectId }, previous).catch((rollbackError) => {
      logger.error({ rollbackError, projectId }, 'Could not roll back project update')
    })
    throw error
  }

  return project
}

export async function archiveAndDeleteProject(projectId, actor = 'system') {
  const project = await Project.findById(projectId).lean()
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
    const result = await Project.deleteOne({ _id: originalId })
    if (result.deletedCount !== 1) throw notFound()
    deleted = true
    await Activity.create({
      projectId: originalId,
      type: 'Deleted',
      title: project.title,
      detail: `Project "${project.title}" was archived and deleted.`,
      actor,
    })
  } catch (error) {
    if (deleted) {
      await Project.replaceOne({ _id: originalId }, project, { upsert: true }).catch((rollbackError) => {
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
