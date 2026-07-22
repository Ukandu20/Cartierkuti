// src/routes/project.router.js
import { Router } from 'express'
import mongoose from 'mongoose'
import multer from 'multer'
import asyncHandler from 'express-async-handler'
import rateLimit from 'express-rate-limit'
import Project from '../models/project.model.js'
import ArchivedProject from '../models/archive.model.js'
import requireAdmin from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  objectIdSchema,
  archiveQuerySchema,
  projectUpdateSchema,
  projectWriteSchema,
  reviewQuerySchema,
  reviewWriteSchema,
  imageAssetDeleteSchema,
} from '../validation/schemas.js'
import cloudinary from '../config/cloudinary.js'
import {
  archiveAndDeleteProject,
  createProject,
  updateProject,
} from '../services/project.service.js'
import { destroyProjectImage } from '../services/project-image.service.js'

const hitLimiter = rateLimit({ windowMs: 60_000, max: 5 })
const reviewLimiter = rateLimit({ windowMs: 60_000, max: 10 })
const projectRouter = Router()

const serializeProject = (project) => {
  const value = typeof project?.toObject === 'function' ? project.toObject() : project
  const tools = value?.tools?.length ? value.tools : value?.languages || []
  return {
    ...value,
    methods: value?.methods || [],
    tools,
    // Keep the legacy response field until every deployed client has moved to `tools`.
    languages: tools,
    tags: value?.tags || [],
  }
}

const hasImageSignature = (buffer) => {
  if (!buffer?.length) return false
  const hex = buffer.subarray(0, 12).toString('hex')
  return (
    hex.startsWith('ffd8ff') ||
    hex.startsWith('89504e470d0a1a0a') ||
    hex.startsWith('474946383761') ||
    hex.startsWith('474946383961') ||
    (hex.startsWith('52494646') && buffer.subarray(8, 12).toString('ascii') === 'WEBP')
  )
}

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
    if (!hasImageSignature(req.file.buffer)) {
      return res.status(400).json({ message: 'Uploaded file is not a supported image' })
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

    res.json({ imageUrl: result.secure_url, imageAssetId: result.public_id || '' })
  }),
)

projectRouter.delete(
  '/upload',
  requireAdmin,
  validate({ body: imageAssetDeleteSchema }),
  asyncHandler(async (req, res) => {
    await destroyProjectImage(req.body.imageAssetId)
    res.status(204).send()
  }),
)

/* CRUD: PROJECTS */
projectRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const projects = await Project.find()
      .select('category categorySlug title description methods tools languages status tags metadata externalLink githubLink liveDemoLink imageUrl imageAssetId featured views reviews.stars createdDate lastUpdatedDate')
      .lean()
    res.json(projects.map(serializeProject))
  }),
)

projectRouter.get(
  '/archived',
  requireAdmin,
  validate({ query: archiveQuerySchema }),
  asyncHandler(async (req, res) => {
    const { projectId, limit = 50, page = 1 } = req.query
    const filter = {}
    if (projectId) filter.originalId = projectId

    const skip = (page - 1) * limit
    const docs = await ArchivedProject.find(filter)
      .sort({ deletedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await ArchivedProject.countDocuments(filter)
    res.json({ archived: docs, total, page, limit })
  }),
)

projectRouter.get(
  '/:id',
  validate({ params: objectIdSchema }),
  asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ message: 'Not found' })
    res.json(serializeProject(project))
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
    const project = await createProject(req.body, req.user?.username)
    res.status(201).json(serializeProject(project))
  }),
)

projectRouter.put(
  '/:id',
  requireAdmin,
  validate({ params: objectIdSchema, body: projectUpdateSchema }),
  asyncHandler(async (req, res) => {
    const project = await updateProject(req.params.id, req.body, req.user?.username)
    res.json(serializeProject(project))
  }),
)

projectRouter.delete(
  '/:id',
  requireAdmin,
  validate({ params: objectIdSchema }),
  asyncHandler(async (req, res) => {
    await archiveAndDeleteProject(req.params.id, req.user?.username)
    res.status(204).send()
  }),
)

/* REVIEWS */
projectRouter.get(
  '/:id/reviews',
  validate({ params: objectIdSchema, query: reviewQuerySchema }),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query
    const skip = (page - 1) * limit
    const [result] = await Project.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
      {
        $project: {
          total: { $size: { $ifNull: ['$reviews', []] } },
          reviews: {
            $slice: [
              { $reverseArray: { $ifNull: ['$reviews', []] } },
              skip,
              limit,
            ],
          },
        },
      },
    ])
    if (!result) return res.status(404).json({ message: 'Project not found' })
    res.json({ reviews: result.reviews, total: result.total, page, limit })
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

    if (project.reviews.length >= 500) {
      return res.status(409).json({ message: 'This project is not accepting more reviews' })
    }
    project.reviews.push({ stars, comment, date: new Date() })
    await project.save()

    const review = project.reviews.at(-1)
    res.status(201).json({ review, avgStars: project.avgStars, total: project.reviews.length })
  }),
)

export default projectRouter
