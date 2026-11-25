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
    program: { type: String, default: '' },
    level: { type: String, default: '' },
    status: { type: String, default: '' },
    visible: { type: Boolean, default: true },
    startDate: { type: String, default: '' },
    finishDate: { type: String, default: '' },
    expectedFinishDate: { type: String, default: '' },
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
    credentialId: { type: String, default: '' },
    credentialUrl: { type: String, default: '' },
    showCredentialLink: { type: Boolean, default: false },
  },
  { _id: true }
)

const resumeSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'primary', unique: true, immutable: true },
    pageContent: { type: mongoose.Schema.Types.Mixed, default: undefined },
    homeContent: { type: mongoose.Schema.Types.Mixed, default: undefined },
    footerContent: { type: mongoose.Schema.Types.Mixed, default: undefined },
    headline: { type: String, default: '' },
    summary: { type: String, default: '' },
    highlights: { type: [String], default: [] },
    metrics: { type: [metricSchema], default: [] },
    experience: { type: [experienceSchema], default: [] },
    education: { type: [educationSchema], default: [] },
    certifications: { type: [certificationSchema], default: [] },
    personalItems: { type: [new mongoose.Schema({
      title: { type: String, required: true },
      category: { type: String, enum: ['Language', 'Learning', 'Interest', 'Volunteering'], default: 'Interest' },
      status: { type: String, default: '' },
      level: { type: String, default: '' },
      notes: { type: String, default: '' },
      visible: { type: Boolean, default: true },
    })], default: [] },
    gallery: { type: [new mongoose.Schema({
      title: { type: String, required: true },
      caption: { type: String, default: '' },
      date: { type: String, default: '' },
      location: { type: String, default: '' },
      imageUrl: { type: String, default: '' },
      imageAssetId: { type: String, default: '' },
      altText: { type: String, default: '' },
      visible: { type: Boolean, default: true },
      featured: { type: Boolean, default: false },
    })], default: [] },
    skills: {
      primary: { type: [String], default: [] },
      secondary: { type: [String], default: [] },
      tools: { type: [String], default: [] },
    },
    resumeFileUrl: { type: String, default: '' },
    resumeFileName: { type: String, default: '' },
    resumeFileUpdatedAt: { type: Date },
  },
  { timestamps: true }
)

export default mongoose.model(
  'Resume',
  resumeSchema,
  process.env.NODE_ENV === 'production' ? 'resume_data_prod' : 'resume_data'
)
