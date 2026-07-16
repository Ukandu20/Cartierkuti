import mongoose from 'mongoose'

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
    reviews: {
      type: [reviewSchema],
      default: [],
      validate: {
        validator: (reviews) => reviews.length <= 500,
        message: 'A project cannot contain more than 500 reviews',
      },
    },
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

export default mongoose.model(
  'Project',
  projectSchema,
  process.env.NODE_ENV === 'production'
    ? 'project_data_prod'
    : 'project_data',
)
