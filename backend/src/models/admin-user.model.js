import mongoose from 'mongoose'

const adminUserSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'primary', unique: true, immutable: true },
    username: { type: String, required: true, trim: true, maxlength: 64 },
    usernameNormalized: { type: String, required: true, unique: true, select: false },
    recoveryEmail: { type: String, required: true, trim: true, lowercase: true, select: false },
    passwordHash: { type: String, required: true, select: false },
    mfaEnabled: { type: Boolean, default: false },
    mfaSecretEncrypted: { type: String, default: '', select: false },
    pendingMfaSecretEncrypted: { type: String, default: '', select: false },
    recoveryCodeHashes: { type: [String], default: [], select: false },
    mfaLoginChallengeHash: { type: String, default: '', select: false },
    mfaLoginChallengeExpiresAt: { type: Date, default: null, select: false },
    credentialVersion: { type: Number, default: 1, min: 1 },
    passwordChangedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export default mongoose.model(
  'AdminUser',
  adminUserSchema,
  process.env.NODE_ENV === 'production' ? 'admin_users_prod' : 'admin_users'
)
