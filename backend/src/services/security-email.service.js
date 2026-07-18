import logger from '../logger.js'

export async function sendSecurityEmail({ to, subject, text }) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.SECURITY_EMAIL_FROM

  if (!apiKey || !from) {
    logger.warn({ subject }, 'Security email was not sent because RESEND_API_KEY or SECURITY_EMAIL_FROM is missing')
    return false
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [to], subject, text }),
      signal: AbortSignal.timeout(10_000),
    })

    if (!response.ok) {
      const responseText = await response.text()
      logger.error({ status: response.status, responseText }, 'Security email delivery failed')
      return false
    }

    return true
  } catch (error) {
    logger.error({ err: error }, 'Security email delivery failed')
    return false
  }
}
