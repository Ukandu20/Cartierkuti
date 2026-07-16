// src/models/activity.model.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const ActivitySchema = new Schema({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['Created', 'Updated', 'Deleted'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  detail: {
    type: String,
    default: null,
  },
  actor: { type: String, default: 'system', trim: true },
}, {
  timestamps: { createdAt: 'timestamp', updatedAt: false }
});

ActivitySchema.index({ timestamp: -1 });
ActivitySchema.index({ type: 1, timestamp: -1 });

export default mongoose.model('Activity', ActivitySchema);
