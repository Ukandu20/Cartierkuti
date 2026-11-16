import crypto from 'crypto'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { Router } from 'express'
import multer from 'multer'
import asyncHandler from 'express-async-handler'
import requireAdmin from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import Resume from '../models/resume.model.js'
import { resumeWriteSchema } from '../validation/schemas.js'
import cloudinary from '../config/cloudinary.js'
import logger from '../logger.js'

const resumeRouter = Router()
const RESUME_KEY = 'primary'

const findResume = () => Resume.findOne({ key: RESUME_KEY }).then(
  (resume) => resume || Resume.findOne({ key: { $exists: false } }),
)

const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF resume uploads are allowed'))
    }
    return cb(null, true)
  },
})

// Upload to a new asset so a failed database write cannot replace the live PDF.
const uploadPdf = async (file) => {
  if (file.buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
    throw Object.assign(new Error('Uploaded file is not a valid PDF'), { status: 400 })
  }
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary is not configured')
  }
  const assetId = `cartierkuti/resume/${crypto.randomUUID()}.pdf`
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'raw', public_id: assetId, overwrite: false, use_filename: false },
      (error, uploaded) => error ? reject(error) : resolve(uploaded),
    )
    stream.end(file.buffer)
  })
  return {
    assetId: result.public_id || assetId,
    fields: {
      resumeFileUrl: result.secure_url,
      resumeFileName: file.originalname,
      resumeFileUpdatedAt: new Date(),
    },
  }
}

const publishResume = async (content, file) => {
  const uploaded = file ? await uploadPdf(file) : null
  try {
    const existing = await findResume()
    return await Resume.findOneAndUpdate(
      existing ? { _id: existing._id } : { key: RESUME_KEY },
      { $set: { ...content, ...uploaded?.fields, key: RESUME_KEY } },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
    )
  } catch (error) {
    if (uploaded) {
      await cloudinary.uploader.destroy(uploaded.assetId, { resource_type: 'raw' }).catch((cleanupError) => {
        logger.error({ err: cleanupError, assetId: uploaded.assetId }, 'Could not remove unpublished resume PDF')
      })
    }
    throw error
  }
}

const parseResumeContent = (req, _res, next) => {
  if (!req.is('multipart/form-data')) return next()
  try {
    const content = JSON.parse(req.body.content)
    if (Object.keys(req.body).some((key) => key !== 'content')) throw new Error('Unexpected field')
    req.body = content
    next()
  } catch {
    next(Object.assign(new Error('Invalid About page content'), { status: 400 }))
  }
}

const DEFAULT_RESUME = {
  headline: 'Data science and analytics practitioner',
  summary:
    'I turn messy data into clear stories, useful models, and decision-ready dashboards.',
  highlights: [
    'Dashboarding, KPI reporting, and stakeholder data storytelling.',
    'Predictive modeling, experimentation, and practical model evaluation.',
    'Sports performance analytics and applied decision intelligence.',
  ],
  metrics: [
    { label: 'Years', value: '3+', note: 'Professional practice' },
    { label: 'Projects', value: '20+', note: 'Analytics and software' },
    { label: 'Focus', value: 'Analytics', note: 'Models and sports' },
  ],
  experience: [
    {
      role: 'Full-Stack Developer',
      company: 'Freelance',
      location: 'Remote',
      period: '2022 - Present',
      bullets: [
        'Shipped analytics dashboards and data pipelines for clients.',
        'Automated reporting workflows and data QA checks.',
      ],
    },
  ],
  education: [
    {
      school: 'University of Windsor',
      degree: 'B.Sc. Computer Science',
      period: '2019 - 2023',
      bullets: ['Data structures, algorithms, and software engineering.'],
    },
  ],
  certifications: [
    {
      name: 'Data Science Specialisation',
      issuer: 'Coursera / edX',
      year: '2023',
      credentialId: '',
      credentialUrl: '',
      showCredentialLink: false,
    },
  ],
  skills: {
    primary: ['Python', 'SQL', 'Pandas', 'React'],
    secondary: ['Tableau', 'Power BI', 'scikit-learn', 'Node.js'],
    tools: ['Git', 'Docker', 'Linux', 'MongoDB'],
  },
  resumeFileUrl: '',
  resumeFileName: '',
}

const getSafePdfFilename = (value) => {
  const filename = (value || 'Preston-Ukandu-Resume.pdf')
    .replace(/[^\w .-]/g, '')
    .trim()

  return filename.toLowerCase().endsWith('.pdf')
    ? filename
    : 'Preston-Ukandu-Resume.pdf'
}

resumeRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const resume = await findResume()
    res.json(resume || { ...DEFAULT_RESUME, key: RESUME_KEY })
  })
)

resumeRouter.put(
  '/',
  requireAdmin,
  resumeUpload.single('resume'),
  parseResumeContent,
  validate({ body: resumeWriteSchema }),
  asyncHandler(async (req, res) => {
    const updated = await publishResume(req.body, req.file)
    res.json(updated)
  })
)

resumeRouter.post(
  '/file',
  requireAdmin,
  resumeUpload.single('resume'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No resume file received' })
    }
    const updated = await publishResume({}, req.file)

    res.json({
      resumeFileUrl: updated.resumeFileUrl,
      resumeFileName: updated.resumeFileName,
      resumeFileUpdatedAt: updated.resumeFileUpdatedAt,
    })
  })
)

resumeRouter.get(
  '/file/download',
  asyncHandler(async (_req, res) => {
    const resume = await findResume()
    if (!resume?.resumeFileUrl) {
      return res.status(404).json({ message: 'No resume PDF has been uploaded' })
    }

    const controller = new AbortController()
    const abortDownload = () => controller.abort()
    res.once('close', abortDownload)
    try {
      const response = await fetch(resume.resumeFileUrl, {
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(30_000)]),
      })
      if (!response.ok || !response.body) {
        await response.body?.cancel()
        return res.status(502).json({ message: 'Could not fetch resume PDF' })
      }
      const filename = getSafePdfFilename(resume.resumeFileName)
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=300',
      })
      await pipeline(Readable.fromWeb(response.body), res)
    } catch (error) {
      if (res.headersSent) res.destroy(error)
      else throw error
    } finally {
      res.off('close', abortDownload)
    }
  })
)

export default resumeRouter
