// middleware/auth.js
export default function checkAdminSecret(req, res, next) {
  const token = req.header('Authorization')?.replace(/^Bearer\s+/, '');
  if (token !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}
