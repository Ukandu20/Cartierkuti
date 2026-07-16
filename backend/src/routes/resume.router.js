import { Router } from 'express'
import multer from 'multer'
import asyncHandler from 'express-async-handler'
import requireAdmin from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import Resume from '../models/resume.model.js'
import { resumeWriteSchema } from '../validation/schemas.js'
import cloudinary from '../config/cloudinary.js'

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
    { name: 'Data Science Specialisation', issuer: 'Coursera / edX', year: '2023' },
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
  validate({ body: resumeWriteSchema }),
  asyncHandler(async (req, res) => {
    const existing = await findResume()
    const updated = await Resume.findOneAndUpdate(existing ? { _id: existing._id } : { key: RESUME_KEY }, {
      ...req.body,
      key: RESUME_KEY,
    }, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    })
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
    if (req.file.buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
      return res.status(400).json({ message: 'Uploaded file is not a valid PDF' })
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
        {
          folder: 'cartierkuti/resume',
          resource_type: 'raw',
          public_id: 'resume.pdf',
          overwrite: true,
          use_filename: false,
        },
        (error, uploadResult) => {
          if (error) return reject(error)
          return resolve(uploadResult)
        },
      )
      stream.end(req.file.buffer)
    })

    const existing = await findResume()
    const updated = await Resume.findOneAndUpdate(
      existing ? { _id: existing._id } : { key: RESUME_KEY },
      {
        key: RESUME_KEY,
        resumeFileUrl: result.secure_url,
        resumeFileName: req.file.originalname,
        resumeFileUpdatedAt: new Date(),
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    )

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

    const response = await fetch(resume.resumeFileUrl)
    if (!response.ok) {
      return res.status(502).json({ message: 'Could not fetch resume PDF' })
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    const filename = getSafePdfFilename(resume.resumeFileName)

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
      'Cache-Control': 'private, max-age=300',
    })
    res.send(buffer)
  })
)

export default resumeRouter
