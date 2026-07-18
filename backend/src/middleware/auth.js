import jwt from 'jsonwebtoken'
import AdminUser from '../models/admin-user.model.js'

const JWT_ISSUER = 'cartierkuti-api'
const JWT_AUDIENCE = 'cartierkuti-admin'

export async function requireAdmin(req, res, next) {
  const authHeader = req.header('Authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: 'Server misconfigured' })
  }

  if (!token || token === authHeader) {
    return res.status(401).json({ message: 'Missing bearer token' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    })
    if (payload?.role !== 'admin' || !payload.sub || !Number.isInteger(payload.credentialVersion)) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const admin = await AdminUser.findById(payload.sub)
    if (!admin || admin.credentialVersion !== payload.credentialVersion) {
      return res.status(401).json({ message: 'Invalid or expired token' })
    }

    req.user = {
      id: admin.id,
      username: admin.username,
      role: payload.role,
      credentialVersion: admin.credentialVersion,
    }
    return next()
  } catch (error) {
    if (error?.name !== 'JsonWebTokenError' && error?.name !== 'TokenExpiredError') return next(error)
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

export default requireAdmin
