import mongoose from 'mongoose';

// 1) Define a separate sub-schema for reviews
const reviewSchema = new mongoose.Schema({
  stars: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { _id: true });

const projectSchema = new mongoose.Schema
({
  category: { 
    type: String, 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  languages: { 
    type: [String], 
    required: true 
  },
  status: { 
    type: String, 
    required: true 
  },
  tags: { 
    type: [String], 
    required: true 
  },
  metadata: { 
    type: String, 
    required: false, 
    default: '' 
  },
  externalLink: { 
    type: String, 
    required: true 
  },
  githubLink: { 
    type: String, 
    required: true 
  },
  liveDemoLink: { 
    type: String, 
    required: false 
  },
  imageUrl: { 
    type: String, 
    required: false 
  },
  featured: {
    type: Boolean,
    required: true,
    default: false,                   
  },
  views: {
    type: Number, 
    default: 0 
  },
  // 3) Embed reviews as an array of sub-docs
  reviews: [reviewSchema],
  }, 
  {
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 4) Virtual for average stars
projectSchema.virtual('avgStars').get(function() {
  if (!this.reviews || this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, r) => acc + r.stars, 0);
  return Math.round((sum / this.reviews.length) * 100) / 100; 
  // rounded to 2 decimal places
});


projectSchema.index({ featured: 1, date: -1 });
projectSchema.index({ views: -1 });
projectSchema.index({ title: 'text', description: 'text' });

// pick collection based on NODE_ENV:
const collectionName =
  process.env.NODE_ENV === 'production'
    ? 'project_data_prod'
    : 'project_data';

export default mongoose.model('Project', projectSchema, collectionName);