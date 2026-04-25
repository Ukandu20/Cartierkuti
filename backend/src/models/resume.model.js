import mongoose from 'mongoose'

const metricSchema = new mongoose.Schema(
  {
    label: { type: String, default: '' },
    value: { type: String, default: '' },
    note: { type: String, default: '' },
  },
  { _id: true }
)

const experienceSchema = new mongoose.Schema(
  {
    role: { type: String, default: '' },
    company: { type: String, default: '' },
    location: { type: String, default: '' },
    period: { type: String, default: '' },
    bullets: { type: [String], default: [] },
  },
  { _id: true }
)

const educationSchema = new mongoose.Schema(
  {
    school: { type: String, default: '' },
    degree: { type: String, default: '' },
    period: { type: String, default: '' },
    bullets: { type: [String], default: [] },
  },
  { _id: true }
)

const certificationSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    issuer: { type: String, default: '' },
    year: { type: String, default: '' },
  },
  { _id: true }
)

const resumeSchema = new mongoose.Schema(
  {
    headline: { type: String, default: '' },
    summary: { type: String, default: '' },
    highlights: { type: [String], default: [] },
    metrics: { type: [metricSchema], default: [] },
    experience: { type: [experienceSchema], default: [] },
    education: { type: [educationSchema], default: [] },
    certifications: { type: [certificationSchema], default: [] },
    skills: {
      primary: { type: [String], default: [] },
      secondary: { type: [String], default: [] },
      tools: { type: [String], default: [] },
    },
  },
  { timestamps: true }
)

export default mongoose.model(
  'Resume',
  resumeSchema,
  process.env.NODE_ENV === 'production' ? 'resume_data_prod' : 'resume_data'
)
