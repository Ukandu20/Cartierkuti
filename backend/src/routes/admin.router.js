import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import rateLimit from 'express-rate-limit'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { requireAdmin } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { authLoginSchema } from '../validation/schemas.js'

const adminRouter = Router()
const JWT_ISSUER = 'cartierkuti-api'
const JWT_AUDIENCE = 'cartierkuti-admin'

const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts' },
  skip: () => process.env.NODE_ENV === 'test',
})

adminRouter.post(
  '/login',
  loginLimiter,
  validate({ body: authLoginSchema }),
  asyncHandler(async (req, res) => {
    const { username, password } = req.body
    const configuredUsername = process.env.ADMIN_USERNAME
    const passwordHash = process.env.ADMIN_PASSWORD_HASH
    const jwtSecret = process.env.JWT_SECRET

    if (!configuredUsername || !passwordHash || !jwtSecret) {
      return res.status(500).json({ error: 'Server misconfigured' })
    }

    const validUsername = username === configuredUsername
    const validPassword = await bcrypt.compare(password, passwordHash)
    if (!validUsername || !validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const expiresIn = process.env.ADMIN_TOKEN_TTL || '30m'
    const token = jwt.sign(
      { username, role: 'admin' },
      jwtSecret,
      {
        subject: username,
        expiresIn,
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      }
    )
    const expiresAt = jwt.decode(token).exp * 1000

    res.json({
      token,
      expiresIn,
      expiresAt,
      user: { username, role: 'admin' },
    })
  })
)

adminRouter.get('/verify', requireAdmin, (req, res) => {
  res.json({ user: req.user })
})

export default adminRouter
