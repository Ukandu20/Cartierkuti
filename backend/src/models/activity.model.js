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
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: { createdAt: 'timestamp', updatedAt: false }
});

export default mongoose.model('Activity', ActivitySchema);
