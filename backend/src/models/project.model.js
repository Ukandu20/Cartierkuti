import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  category: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  languages: { type: [String], required: true },
  status: { type: String, required: true },
  tags: { type: [String], required: true },
  metadata: { type: String, required: true },
  externalLink: { type: String, required: true },
  githubLink: { type: String, required: true },
  liveDemoLink: { type: String, required: false },
  imageUrl: { type: String, required: false },
  date: { type: Date, required: true },
  featured: { type: Boolean, required: true },
  views:      { type: Number, default: 0 },
  ratings:    [{
  stars:   { type: Number, required: true },
  comment: { type: String },
  date:    { type: Date, default: Date.now }
  }],
  avgStars:   { type: Number, default: 0 }, 
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