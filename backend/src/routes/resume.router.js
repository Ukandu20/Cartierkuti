import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import requireAdmin from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import Resume from '../models/resume.model.js'
import { resumeWriteSchema } from '../validation/schemas.js'

const resumeRouter = Router()

const DEFAULT_RESUME = {
  headline: 'Data analyst and security-minded developer',
  summary:
    'I build analytics systems that reveal risk, improve decisions, and secure data workflows.',
  highlights: [
    'Dashboarding, KPI reporting, and stakeholder storytelling.',
    'Threat-aware analytics and operational telemetry.',
    'Predictive modeling and anomaly detection.',
  ],
  metrics: [
    { label: 'Years', value: '3+', note: 'Professional practice' },
    { label: 'Projects', value: '20+', note: 'Data and software' },
    { label: 'Focus', value: 'Analytics', note: 'Security-aware' },
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
    secondary: ['Tableau', 'Power BI', 'Node.js', 'Express'],
    tools: ['Git', 'Docker', 'Linux', 'MongoDB'],
  },
}

resumeRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    let resume = await Resume.findOne()
    if (!resume) {
      resume = await Resume.create(DEFAULT_RESUME)
    }
    res.json(resume)
  })
)

resumeRouter.put(
  '/',
  requireAdmin,
  validate({ body: resumeWriteSchema }),
  asyncHandler(async (req, res) => {
    const updated = await Resume.findOneAndUpdate({}, req.body, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    })
    res.json(updated)
  })
)

export default resumeRouter
