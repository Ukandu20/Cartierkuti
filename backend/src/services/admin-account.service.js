import AdminUser from '../models/admin-user.model.js'
import logger from '../logger.js'

export const normalizeUsername = (username) => String(username || '').trim().toLowerCase()
export const normalizeEmail = (email) => String(email || '').trim().toLowerCase()

export async function ensureAdminAccount() {
  const existing = await AdminUser.findOne({ key: 'primary' })
  if (existing) return existing

  const username = process.env.ADMIN_USERNAME?.trim()
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim()
  const recoveryEmail = normalizeEmail(process.env.ADMIN_RECOVERY_EMAIL)

  if (!username || !passwordHash || !recoveryEmail) {
    logger.error('Admin bootstrap requires ADMIN_USERNAME, ADMIN_PASSWORD_HASH, and ADMIN_RECOVERY_EMAIL')
    return null
  }

  try {
    const created = await AdminUser.create({
      key: 'primary',
      username,
      usernameNormalized: normalizeUsername(username),
      recoveryEmail,
      passwordHash,
    })
    logger.info('Database-backed admin account bootstrapped')
    return created
  } catch (error) {
    if (error?.code === 11000) return AdminUser.findOne({ key: 'primary' })
    throw error
  }
}

export async function findAdminForAuthentication(username) {
  await ensureAdminAccount()
  return AdminUser.findOne({ usernameNormalized: normalizeUsername(username) })
    .select('+usernameNormalized +recoveryEmail +passwordHash +mfaLoginChallengeHash +mfaLoginChallengeExpiresAt')
}

export async function findAdminByRecoveryEmail(email) {
  await ensureAdminAccount()
  return AdminUser.findOne({ recoveryEmail: normalizeEmail(email) })
    .select('+recoveryEmail +passwordHash +usernameNormalized')
}
