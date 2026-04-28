import jwt from 'jsonwebtoken'

export function requireAdmin(req, res, next) {
  const authHeader = req.header('Authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: 'Server misconfigured' })
  }

  if (!token || token === authHeader) {
    return res.status(401).json({ message: 'Missing bearer token' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    if (payload?.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' })
    }
    req.user = {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
    }
    return next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

export default requireAdmin
