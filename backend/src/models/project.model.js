import mongoose from 'mongoose'
import Activity from './activity.model.js'
import logger from '../logger.js'

const reviewSchema = new mongoose.Schema({
  stars: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  date: { type: Date, default: Date.now },
}, { _id: true })

const projectSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    languages: { type: [String], required: true },
    status: { type: String, required: true },
    tags: { type: [String], required: true },
    metadata: { type: String, default: '' },
    externalLink: { type: String, required: true },
    githubLink: { type: String, required: true },
    liveDemoLink: { type: String },
    imageUrl: { type: String },
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    reviews: [reviewSchema],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: {
      createdAt: 'createdDate',
      updatedAt: 'lastUpdatedDate',
    },
  },
)

projectSchema.virtual('avgStars').get(function() {
  if (!this.reviews?.length) return 0
  const sum = this.reviews.reduce((acc, review) => acc + review.stars, 0)
  return Math.round((sum / this.reviews.length) * 100) / 100
})

// Activity hooks
projectSchema.post('save', async function(doc) {
  if (doc.isNew) {
    try {
      await Activity.create({
        projectId: doc._id,
        type: 'Created',
        title: doc.title,
        detail: `Project "${doc.title}" was created.`,
      })
    } catch (err) {
      logger.error({ err, projectId: doc._id }, 'Activity hook error on project create')
    }
  }
})

projectSchema.post('findOneAndUpdate', async function(doc) {
  if (doc) {
    try {
      await Activity.create({
        projectId: doc._id,
        type: 'Updated',
        title: doc.title,
        detail: 'Project details were updated.',
      })
    } catch (err) {
      logger.error({ err, projectId: doc._id }, 'Activity hook error on project update')
    }
  }
})

export default mongoose.model(
  'Project',
  projectSchema,
  process.env.NODE_ENV === 'production'
    ? 'project_data_prod'
    : 'project_data',
)
