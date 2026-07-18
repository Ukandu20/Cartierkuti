import crypto from 'crypto'

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

const encryptionKey = () => crypto
  .createHash('sha256')
  .update(process.env.MFA_ENCRYPTION_KEY || process.env.JWT_SECRET || '')
  .digest()

const base32Encode = (buffer) => {
  let bits = ''
  for (const byte of buffer) bits += byte.toString(2).padStart(8, '0')
  let output = ''
  for (let index = 0; index < bits.length; index += 5) {
    output += BASE32_ALPHABET[Number.parseInt(bits.slice(index, index + 5).padEnd(5, '0'), 2)]
  }
  return output
}

const base32Decode = (value) => {
  const normalized = value.toUpperCase().replace(/[^A-Z2-7]/g, '')
  let bits = ''
  for (const character of normalized) bits += BASE32_ALPHABET.indexOf(character).toString(2).padStart(5, '0')
  const bytes = []
  for (let index = 0; index + 8 <= bits.length; index += 8) bytes.push(Number.parseInt(bits.slice(index, index + 8), 2))
  return Buffer.from(bytes)
}

const tokenAt = (secret, timestamp) => {
  const counter = Math.floor(timestamp / 30_000)
  const counterBuffer = Buffer.alloc(8)
  counterBuffer.writeBigUInt64BE(BigInt(counter))
  const digest = crypto.createHmac('sha1', base32Decode(secret)).update(counterBuffer).digest()
  const offset = digest[digest.length - 1] & 0x0f
  const number = (digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000
  return number.toString().padStart(6, '0')
}

export const generateTotpSecret = () => base32Encode(crypto.randomBytes(20))
export const generateTotpCode = (secret, now = Date.now()) => tokenAt(secret, now)

export const buildOtpAuthUri = ({ secret, username }) => {
  const issuer = 'Cartierkuti Admin'
  const label = encodeURIComponent(`${issuer}:${username}`)
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`
}

export const verifyTotp = (secret, code, now = Date.now()) => {
  const normalized = String(code || '').replace(/\s/g, '')
  if (!/^\d{6}$/.test(normalized)) return false
  return [-1, 0, 1].some((offset) => {
    const expected = tokenAt(secret, now + offset * 30_000)
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(normalized))
  })
}

export const encryptMfaSecret = (secret) => {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()])
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('base64url')).join('.')
}

export const decryptMfaSecret = (encrypted) => {
  const parts = String(encrypted || '').split('.')
  if (parts.length !== 3) return ''
  const [iv, tag, payload] = parts.map((part) => Buffer.from(part, 'base64url'))
  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(payload), decipher.final()]).toString('utf8')
}

export const hashRecoveryCode = (code) => crypto.createHash('sha256').update(String(code).toUpperCase()).digest('hex')

export const generateRecoveryCodes = (count = 8) => Array.from({ length: count }, () => {
  const raw = crypto.randomBytes(8).toString('hex').toUpperCase()
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}-${raw.slice(12)}`
})

export const verifyAndConsumeMfaCode = (admin, code) => {
  const normalized = String(code || '').trim().toUpperCase()
  const secret = decryptMfaSecret(admin.mfaSecretEncrypted)
  if (verifyTotp(secret, normalized)) return { valid: true, usedRecoveryCode: false }

  const recoveryHash = hashRecoveryCode(normalized)
  const index = admin.recoveryCodeHashes.indexOf(recoveryHash)
  if (index < 0) return { valid: false, usedRecoveryCode: false }
  admin.recoveryCodeHashes.splice(index, 1)
  return { valid: true, usedRecoveryCode: true }
}
