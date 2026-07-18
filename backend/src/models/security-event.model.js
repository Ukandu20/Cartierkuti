import mongoose from 'mongoose'

const securityEventSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', index: true },
    type: {
      type: String,
      enum: [
        'login_succeeded',
        'login_failed',
        'password_reset_requested',
        'password_reset_completed',
        'username_recovery_requested',
        'credentials_changed',
        'mfa_enabled',
        'mfa_disabled',
        'mfa_challenge_failed',
      ],
      required: true,
      index: true,
    },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '', maxlength: 500 },
    detail: { type: String, default: '', maxlength: 500 },
  },
  { timestamps: true }
)

securityEventSchema.index({ createdAt: -1 })

export default mongoose.model(
  'SecurityEvent',
  securityEventSchema,
  process.env.NODE_ENV === 'production' ? 'security_events_prod' : 'security_events'
)
