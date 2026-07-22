import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    normalizedName: { type: String, required: true, unique: true, select: false },
    slug: { type: String, required: true, unique: true, immutable: true, maxlength: 90 },
    aliases: { type: [String], default: [] },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    archivedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

export default mongoose.model('Category', categorySchema)
