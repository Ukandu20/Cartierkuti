import SecurityEvent from '../models/security-event.model.js'
import logger from '../logger.js'

export function requestSecurityContext(req) {
  return {
    ip: req.ip || '',
    userAgent: String(req.get('user-agent') || '').slice(0, 500),
  }
}

export async function recordSecurityEvent({ adminId, type, detail = '', ...context }) {
  try {
    await SecurityEvent.create({ adminId, type, detail, ...context })
  } catch (error) {
    logger.error({ err: error, type }, 'Unable to record security event')
  }
}
