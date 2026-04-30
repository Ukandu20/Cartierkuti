// src/routes/project.router.js
import { Router } from 'express'
import multer from 'multer'
import asyncHandler from 'express-async-handler'
import rateLimit from 'express-rate-limit'
import Project from '../models/project.model.js'
import ArchivedProject from '../models/archive.model.js'
import requireAdmin from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  objectIdSchema,
  projectUpdateSchema,
  projectWriteSchema,
  reviewWriteSchema,
} from '../validation/schemas.js'
import cloudinary from '../config/cloudinary.js'
import logger from '../logger.js'

const hitLimiter = rateLimit({ windowMs: 60_000, max: 5 })
const reviewLimiter = rateLimit({ windowMs: 60_000, max: 10 })
const projectRouter = Router()

/* MULTER SETUP */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype?.startsWith('image/')) {
      return cb(new Error('Only image uploads are allowed'))
    }
    return cb(null, true)
  },
})

/* UPLOAD PREVIEW IMAGE */
projectRouter.post(
  '/upload',
  requireAdmin,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file received' })
    }
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return res.status(500).json({ message: 'Cloudinary is not configured' })
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'cartierkuti', resource_type: 'image' },
        (error, uploadResult) => {
          if (error) return reject(error)
          return resolve(uploadResult)
        },
      )
      stream.end(req.file.buffer)
    })

    res.json({ imageUrl: result.secure_url })
  }),
)

/* CRUD: PROJECTS */
projectRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const projects = await Project.find()
    res.json(projects)
  }),
)

projectRouter.get(
  '/archived',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { projectId, limit = 50, page = 1 } = req.query
    const filter = {}
    if (projectId) filter.originalId = projectId

    const skip = (Math.max(page, 1) - 1) * limit
    const docs = await ArchivedProject.find(filter)
      .sort({ deletedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .lean()

    const total = await ArchivedProject.countDocuments(filter)
    res.json({ archived: docs, total, page: +page, limit: +limit })
  }),
)

projectRouter.get(
  '/:id',
  validate({ params: objectIdSchema }),
  asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ message: 'Not found' })
    res.json(project)
  }),
)

projectRouter.patch(
  '/:id/hit',
  hitLimiter,
  validate({ params: objectIdSchema }),
  asyncHandler(async (req, res) => {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true, select: 'views' },
    )
    if (!project) return res.status(404).json({ message: 'Project not found' })
    res.json({ views: project.views })
  }),
)

projectRouter.post(
  '/',
  requireAdmin,
  validate({ body: projectWriteSchema }),
  asyncHandler(async (req, res) => {
    const project = await Project.create(req.body)
    res.json(project)
  }),
)

projectRouter.put(
  '/:id',
  requireAdmin,
  validate({ params: objectIdSchema, body: projectUpdateSchema }),
  asyncHandler(async (req, res) => {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!project) return res.status(404).json({ message: 'Project not found' })
    res.json(project)
  }),
)

projectRouter.delete(
  '/:id',
  requireAdmin,
  validate({ params: objectIdSchema }),
  asyncHandler(async (req, res) => {
    // Load the project before archiving it.
    const project = await Project.findById(req.params.id).lean()
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    // Pull out _id so Mongo will generate a new one in archive.
    const { _id: originalId, ...rest } = project

    // Attempt to archive before removing the live project.
    try {
      await ArchivedProject.create({
        originalId,
        ...rest,
        deletedAt: new Date(),
        deletedBy: req.user?.id || 'system',
      })
    } catch (err) {
      logger.error({ err, projectId: req.params.id }, 'Failed to archive project')
      return res.status(500).json({ message: 'Could not archive project' })
    }

    // Finally remove it from the live collection.
    try {
      await Project.findByIdAndDelete(originalId)
    } catch (err) {
      logger.error({ err, projectId: req.params.id }, 'Failed to delete project after archiving')
      return res.status(500).json({ message: 'Could not delete project' })
    }

    res.status(204).send()
  }),
)

/* REVIEWS */
projectRouter.get(
  '/:id/reviews',
  validate({ params: objectIdSchema }),
  asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id).select('reviews')
    if (!project) return res.status(404).json({ message: 'Project not found' })
    res.json(project.reviews)
  }),
)

projectRouter.post(
  '/:id/reviews',
  reviewLimiter,
  validate({ params: objectIdSchema, body: reviewWriteSchema }),
  asyncHandler(async (req, res) => {
    const { stars, comment } = req.body
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ message: 'Project not found' })

    project.reviews.push({ stars, comment, date: new Date() })
    await project.save()

    res.json({ avgStars: project.avgStars, total: project.reviews.length })
  }),
)

export default projectRouter
