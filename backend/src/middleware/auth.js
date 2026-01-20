// middleware/auth.js
export default function checkAdminSecret(req, res, next) {
  const headerSecret = req.get('x-admin-secret');
  const bearer = req.header('Authorization')?.replace(/^Bearer\s+/, '');
  const token = headerSecret || bearer;

  if (!process.env.ADMIN_SECRET) {
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  if (!token || token !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return next();
}
