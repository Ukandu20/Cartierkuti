import mongoose from 'mongoose'

const credentialResetTokenSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', required: true, index: true },
    purpose: { type: String, enum: ['password-reset'], required: true },
    tokenHash: { type: String, required: true, unique: true, select: false },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    usedAt: { type: Date, default: null },
    requestedIp: { type: String, default: '', select: false },
  },
  { timestamps: true }
)

export default mongoose.model(
  'CredentialResetToken',
  credentialResetTokenSchema,
  process.env.NODE_ENV === 'production' ? 'credential_reset_tokens_prod' : 'credential_reset_tokens'
)
