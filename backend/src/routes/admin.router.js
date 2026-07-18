import crypto from 'crypto'
import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import rateLimit from 'express-rate-limit'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import AdminUser from '../models/admin-user.model.js'
import CredentialResetToken from '../models/credential-reset-token.model.js'
import { requireAdmin } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  authLoginSchema,
  credentialChangeSchema,
  mfaCodeSchema,
  mfaDisableSchema,
  mfaLoginSchema,
  mfaSetupSchema,
  passwordRecoveryRequestSchema,
  passwordResetSchema,
  usernameRecoveryRequestSchema,
} from '../validation/schemas.js'
import {
  ensureAdminAccount,
  findAdminByRecoveryEmail,
  findAdminForAuthentication,
  normalizeUsername,
} from '../services/admin-account.service.js'
import { sendSecurityEmail } from '../services/security-email.service.js'
import { recordSecurityEvent, requestSecurityContext } from '../services/security-audit.service.js'
import {
  buildOtpAuthUri,
  decryptMfaSecret,
  encryptMfaSecret,
  generateRecoveryCodes,
  generateTotpSecret,
  hashRecoveryCode,
  verifyAndConsumeMfaCode,
  verifyTotp,
} from '../services/totp.service.js'

const adminRouter = Router()
const JWT_ISSUER = 'cartierkuti-api'
const JWT_AUDIENCE = 'cartierkuti-admin'
const RESET_TOKEN_TTL_MS = 15 * 60_000
const GENERIC_RECOVERY_MESSAGE = 'If the account details match, recovery instructions will be sent.'
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('not-the-admin-password', 12)

adminRouter.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

const limiter = (max, message) => rateLimit({
  windowMs: 15 * 60_000,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: message },
  skip: () => process.env.NODE_ENV === 'test',
})

const loginLimiter = limiter(10, 'Too many login attempts')
const recoveryLimiter = limiter(5, 'Too many recovery attempts. Try again later.')
const resetLimiter = limiter(10, 'Too many reset attempts. Try again later.')
const credentialLimiter = limiter(5, 'Too many credential change attempts. Try again later.')

const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex')
const waitForUniformRecoveryResponse = async (startedAt) => {
  if (process.env.NODE_ENV === 'test') return
  const remaining = 350 - (Date.now() - startedAt)
  if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining))
}

const issueAdminToken = (admin) => {
  const expiresIn = process.env.ADMIN_TOKEN_TTL || '30m'
  const token = jwt.sign(
    {
      username: admin.username,
      role: 'admin',
      credentialVersion: admin.credentialVersion,
    },
    process.env.JWT_SECRET,
    {
      subject: admin.id,
      expiresIn,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }
  )
  return { token, expiresIn, expiresAt: jwt.decode(token).exp * 1000 }
}

const issueMfaChallenge = async (admin) => {
  const nonce = crypto.randomBytes(32).toString('base64url')
  admin.mfaLoginChallengeHash = hashResetToken(nonce)
  admin.mfaLoginChallengeExpiresAt = new Date(Date.now() + 5 * 60_000)
  await admin.save()
  return jwt.sign(
    { purpose: 'admin-mfa', credentialVersion: admin.credentialVersion, nonce },
    process.env.JWT_SECRET,
    {
      subject: admin.id,
      expiresIn: '5m',
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }
  )
}

adminRouter.post(
  '/login',
  loginLimiter,
  validate({ body: authLoginSchema }),
  asyncHandler(async (req, res) => {
    if (!process.env.JWT_SECRET) return res.status(500).json({ error: 'Server misconfigured' })

    const admin = await findAdminForAuthentication(req.body.username)
    const validPassword = await bcrypt.compare(req.body.password, admin?.passwordHash || DUMMY_PASSWORD_HASH)
    const validUsername = admin && normalizeUsername(req.body.username) === normalizeUsername(admin.username)
    const context = requestSecurityContext(req)

    if (!validUsername || !validPassword) {
      await recordSecurityEvent({ adminId: admin?._id, type: 'login_failed', ...context })
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    if (admin.mfaEnabled) {
      return res.json({
        mfaRequired: true,
        challengeToken: await issueMfaChallenge(admin),
        expiresIn: '5m',
      })
    }

    await recordSecurityEvent({ adminId: admin._id, type: 'login_succeeded', ...context })
    res.json({
      ...issueAdminToken(admin),
      user: { username: admin.username, role: 'admin' },
    })
  })
)

adminRouter.post(
  '/login/mfa',
  loginLimiter,
  validate({ body: mfaLoginSchema }),
  asyncHandler(async (req, res) => {
    let challenge
    try {
      challenge = jwt.verify(req.body.challengeToken, process.env.JWT_SECRET, {
        algorithms: ['HS256'],
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      })
    } catch {
      return res.status(401).json({ error: 'Invalid or expired verification challenge' })
    }

    if (challenge.purpose !== 'admin-mfa') {
      return res.status(401).json({ error: 'Invalid or expired verification challenge' })
    }

    const admin = await AdminUser.findById(challenge.sub)
      .select('+mfaSecretEncrypted +recoveryCodeHashes +mfaLoginChallengeHash +mfaLoginChallengeExpiresAt')
    const validChallenge = admin
      && admin.mfaEnabled
      && admin.credentialVersion === challenge.credentialVersion
      && admin.mfaLoginChallengeExpiresAt > new Date()
      && admin.mfaLoginChallengeHash
      && crypto.timingSafeEqual(
        Buffer.from(admin.mfaLoginChallengeHash),
        Buffer.from(hashResetToken(challenge.nonce || ''))
      )
    if (!validChallenge) {
      return res.status(401).json({ error: 'Invalid or expired verification challenge' })
    }

    const verification = verifyAndConsumeMfaCode(admin, req.body.code)
    if (!verification.valid) {
      await recordSecurityEvent({
        adminId: admin._id,
        type: 'mfa_challenge_failed',
        ...requestSecurityContext(req),
      })
      return res.status(401).json({ error: 'Invalid verification code' })
    }
    admin.mfaLoginChallengeHash = ''
    admin.mfaLoginChallengeExpiresAt = null
    await admin.save()

    await recordSecurityEvent({
      adminId: admin._id,
      type: 'login_succeeded',
      detail: verification.usedRecoveryCode ? 'recovery-code' : 'totp',
      ...requestSecurityContext(req),
    })
    res.json({
      ...issueAdminToken(admin),
      user: { username: admin.username, role: 'admin' },
    })
  })
)

adminRouter.get('/verify', requireAdmin, (req, res) => {
  res.json({ user: req.user })
})

adminRouter.get(
  '/account',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const admin = await AdminUser.findById(req.user.id).select('+recoveryEmail')
    if (!admin) return res.status(404).json({ error: 'Admin account not found' })
    res.json({
      username: admin.username,
      recoveryEmail: admin.recoveryEmail,
      passwordChangedAt: admin.passwordChangedAt,
      mfaEnabled: admin.mfaEnabled,
    })
  })
)

adminRouter.post(
  '/account/credentials',
  credentialLimiter,
  requireAdmin,
  validate({ body: credentialChangeSchema }),
  asyncHandler(async (req, res) => {
    const admin = await AdminUser.findById(req.user.id)
      .select('+passwordHash +recoveryEmail +usernameNormalized +mfaSecretEncrypted +recoveryCodeHashes')
    if (!admin) return res.status(404).json({ error: 'Admin account not found' })

    const validPassword = await bcrypt.compare(req.body.currentPassword, admin.passwordHash)
    if (!validPassword) return res.status(401).json({ error: 'Current password is incorrect' })
    if (!admin.mfaEnabled) return res.status(403).json({ error: 'Enable two-factor authentication before changing credentials' })
    if (!req.body.mfaCode) return res.status(400).json({ error: 'Enter your authenticator or recovery code' })

    const mfaVerification = verifyAndConsumeMfaCode(admin, req.body.mfaCode)
    if (!mfaVerification.valid) return res.status(401).json({ error: 'Invalid verification code' })

    const changed = []
    if (req.body.newUsername && normalizeUsername(req.body.newUsername) !== admin.usernameNormalized) {
      const duplicate = await AdminUser.exists({
        _id: { $ne: admin._id },
        usernameNormalized: normalizeUsername(req.body.newUsername),
      })
      if (duplicate) return res.status(409).json({ error: 'That username is unavailable' })
      admin.username = req.body.newUsername.trim()
      admin.usernameNormalized = normalizeUsername(req.body.newUsername)
      changed.push('username')
    }

    if (req.body.newPassword) {
      if (await bcrypt.compare(req.body.newPassword, admin.passwordHash)) {
        return res.status(400).json({ error: 'Choose a password different from the current password' })
      }
      admin.passwordHash = await bcrypt.hash(req.body.newPassword, 12)
      admin.passwordChangedAt = new Date()
      changed.push('password')
    }

    if (!changed.length) return res.status(400).json({ error: 'The new credentials match the current account' })

    admin.credentialVersion += 1
    await admin.save()
    await CredentialResetToken.deleteMany({ adminId: admin._id })
    await recordSecurityEvent({
      adminId: admin._id,
      type: 'credentials_changed',
      detail: changed.join(','),
      ...requestSecurityContext(req),
    })
    await sendSecurityEmail({
      to: admin.recoveryEmail,
      subject: 'Your Cartierkuti admin credentials changed',
      text: `The ${changed.join(' and ')} for your Cartierkuti admin account changed. If this was not you, reset the password immediately.`,
    })

    res.json({ message: 'Credentials updated. Sign in again.', reauthenticationRequired: true })
  })
)

adminRouter.post(
  '/account/mfa/setup',
  credentialLimiter,
  requireAdmin,
  validate({ body: mfaSetupSchema }),
  asyncHandler(async (req, res) => {
    const admin = await AdminUser.findById(req.user.id).select('+passwordHash +pendingMfaSecretEncrypted')
    if (!admin) return res.status(404).json({ error: 'Admin account not found' })
    if (admin.mfaEnabled) return res.status(409).json({ error: 'Two-factor authentication is already enabled' })
    if (!await bcrypt.compare(req.body.currentPassword, admin.passwordHash)) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }

    const secret = generateTotpSecret()
    admin.pendingMfaSecretEncrypted = encryptMfaSecret(secret)
    await admin.save()
    res.json({
      secret,
      otpauthUri: buildOtpAuthUri({ secret, username: admin.username }),
    })
  })
)

adminRouter.post(
  '/account/mfa/confirm',
  credentialLimiter,
  requireAdmin,
  validate({ body: mfaCodeSchema }),
  asyncHandler(async (req, res) => {
    const admin = await AdminUser.findById(req.user.id)
      .select('+pendingMfaSecretEncrypted +mfaSecretEncrypted +recoveryCodeHashes +recoveryEmail')
    if (!admin?.pendingMfaSecretEncrypted) return res.status(400).json({ error: 'Start two-factor setup first' })

    const secret = decryptMfaSecret(admin.pendingMfaSecretEncrypted)
    if (!verifyTotp(secret, req.body.code)) return res.status(401).json({ error: 'Invalid verification code' })

    const recoveryCodes = generateRecoveryCodes()
    admin.mfaSecretEncrypted = admin.pendingMfaSecretEncrypted
    admin.pendingMfaSecretEncrypted = ''
    admin.recoveryCodeHashes = recoveryCodes.map(hashRecoveryCode)
    admin.mfaEnabled = true
    admin.credentialVersion += 1
    await admin.save()
    await recordSecurityEvent({ adminId: admin._id, type: 'mfa_enabled', ...requestSecurityContext(req) })
    await sendSecurityEmail({
      to: admin.recoveryEmail,
      subject: 'Two-factor authentication enabled',
      text: 'Two-factor authentication was enabled for your Cartierkuti admin account. If this was not you, reset your password immediately.',
    })

    res.json({
      message: 'Two-factor authentication enabled. Save these recovery codes and sign in again.',
      recoveryCodes,
      reauthenticationRequired: true,
    })
  })
)

adminRouter.delete(
  '/account/mfa',
  credentialLimiter,
  requireAdmin,
  validate({ body: mfaDisableSchema }),
  asyncHandler(async (req, res) => {
    const admin = await AdminUser.findById(req.user.id)
      .select('+passwordHash +mfaSecretEncrypted +recoveryCodeHashes +recoveryEmail')
    if (!admin?.mfaEnabled) return res.status(400).json({ error: 'Two-factor authentication is not enabled' })
    if (!await bcrypt.compare(req.body.currentPassword, admin.passwordHash)) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }
    const verification = verifyAndConsumeMfaCode(admin, req.body.code)
    if (!verification.valid) return res.status(401).json({ error: 'Invalid verification code' })

    admin.mfaEnabled = false
    admin.mfaSecretEncrypted = ''
    admin.pendingMfaSecretEncrypted = ''
    admin.recoveryCodeHashes = []
    admin.credentialVersion += 1
    await admin.save()
    await recordSecurityEvent({ adminId: admin._id, type: 'mfa_disabled', ...requestSecurityContext(req) })
    await sendSecurityEmail({
      to: admin.recoveryEmail,
      subject: 'Two-factor authentication disabled',
      text: 'Two-factor authentication was disabled for your Cartierkuti admin account. If this was not you, reset your password immediately.',
    })
    res.json({ message: 'Two-factor authentication disabled. Sign in again.', reauthenticationRequired: true })
  })
)

adminRouter.post(
  '/recovery/password/request',
  recoveryLimiter,
  validate({ body: passwordRecoveryRequestSchema }),
  asyncHandler(async (req, res) => {
    const startedAt = Date.now()
    const admin = await findAdminByRecoveryEmail(req.body.email)
    const context = requestSecurityContext(req)

    if (admin) {
      await CredentialResetToken.deleteMany({ adminId: admin._id, purpose: 'password-reset' })
      const token = crypto.randomBytes(32).toString('base64url')
      await CredentialResetToken.create({
        adminId: admin._id,
        purpose: 'password-reset',
        tokenHash: hashResetToken(token),
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
        requestedIp: context.ip,
      })
      await recordSecurityEvent({ adminId: admin._id, type: 'password_reset_requested', ...context })

      const resetUrl = new URL('/admin/reset-password', process.env.CLIENT_URL)
      resetUrl.searchParams.set('token', token)
      void sendSecurityEmail({
        to: admin.recoveryEmail,
        subject: 'Reset your Cartierkuti admin password',
        text: `Use this one-time link within 15 minutes to reset your password:\n\n${resetUrl.toString()}\n\nIf you did not request this, no action is needed.`,
      })
    }

    await waitForUniformRecoveryResponse(startedAt)
    res.status(202).json({ message: GENERIC_RECOVERY_MESSAGE })
  })
)

adminRouter.post(
  '/recovery/username',
  recoveryLimiter,
  validate({ body: usernameRecoveryRequestSchema }),
  asyncHandler(async (req, res) => {
    const startedAt = Date.now()
    const admin = await findAdminByRecoveryEmail(req.body.email)
    if (admin) {
      await recordSecurityEvent({
        adminId: admin._id,
        type: 'username_recovery_requested',
        ...requestSecurityContext(req),
      })
      void sendSecurityEmail({
        to: admin.recoveryEmail,
        subject: 'Your Cartierkuti admin username',
        text: `Your Cartierkuti admin username is: ${admin.username}\n\nIf you did not request this reminder, review your account security.`,
      })
    }
    await waitForUniformRecoveryResponse(startedAt)
    res.status(202).json({ message: GENERIC_RECOVERY_MESSAGE })
  })
)

adminRouter.post(
  '/recovery/password/reset',
  resetLimiter,
  validate({ body: passwordResetSchema }),
  asyncHandler(async (req, res) => {
    const resetToken = await CredentialResetToken.findOneAndUpdate(
      {
        tokenHash: hashResetToken(req.body.token),
        purpose: 'password-reset',
        usedAt: null,
        expiresAt: { $gt: new Date() },
      },
      { $set: { usedAt: new Date() } },
      { new: true }
    ).select('+tokenHash')

    if (!resetToken) return res.status(400).json({ error: 'This reset link is invalid or has expired' })

    const admin = await AdminUser.findById(resetToken.adminId).select('+passwordHash +recoveryEmail')
    if (!admin) return res.status(400).json({ error: 'This reset link is invalid or has expired' })
    if (await bcrypt.compare(req.body.password, admin.passwordHash)) {
      return res.status(400).json({ error: 'Choose a password different from the current password' })
    }

    admin.passwordHash = await bcrypt.hash(req.body.password, 12)
    admin.passwordChangedAt = new Date()
    admin.credentialVersion += 1
    await admin.save()
    await CredentialResetToken.deleteMany({ adminId: admin._id, _id: { $ne: resetToken._id } })
    await recordSecurityEvent({
      adminId: admin._id,
      type: 'password_reset_completed',
      ...requestSecurityContext(req),
    })
    await sendSecurityEmail({
      to: admin.recoveryEmail,
      subject: 'Your Cartierkuti admin password was reset',
      text: 'Your Cartierkuti admin password was reset and all previous sessions were signed out. If this was not you, secure your recovery email and reset the password again.',
    })

    res.json({ message: 'Password reset complete. Sign in with your new password.' })
  })
)

export default adminRouter
