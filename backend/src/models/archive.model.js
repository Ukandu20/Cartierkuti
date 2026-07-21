import mongoose from 'mongoose';

const archivedSchema = new mongoose.Schema(
  {
    originalId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    category:      String,
    classificationVersion: Number,
    title:         String,
    description:   String,
    methods:       [String],
    tools:         [String],
    languages:     [String],
    status:        String,
    tags:          [String],
    metadata:      String,
    externalLink:  String,
    githubLink:    String,
    liveDemoLink:  String,
    imageUrl:      String,
    featured:      Boolean,
    views:         Number,
    reviews:       Array,         // or [reviewSchema] if you want to reuse it
    createdDate:   Date,
    lastUpdatedDate: Date,

    deletedAt:     { type: Date, default: Date.now },
    deletedBy:     { type: String, default: '' } // optional user ID/email
  },
  {
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

archivedSchema.index({ originalId: 1, deletedAt: -1 });

export default mongoose.model(
  'ArchivedProject',
  archivedSchema,
  process.env.NODE_ENV === 'production' ? 'archive_prod' : 'archives'
);
