import cors from 'cors'
import logger from '../logger.js'

const DEV_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173']

export const parseAllowedOrigins = (clientUrl = '', nodeEnv = process.env.NODE_ENV) => {
  const configured = clientUrl
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  if (nodeEnv === 'production') {
    if (!configured.length) {
      throw new Error('CLIENT_URL is required in production for CORS')
    }
    return [...new Set(configured)]
  }

  return [...new Set([...configured, ...DEV_ORIGINS])]
}

export const createCorsMiddleware = ({
  clientUrl = process.env.CLIENT_URL || '',
  nodeEnv = process.env.NODE_ENV,
} = {}) => {
  const allowedOrigins = parseAllowedOrigins(clientUrl, nodeEnv)

  return cors({
    origin: (incomingOrigin, callback) => {
      if (!incomingOrigin || allowedOrigins.includes(incomingOrigin)) {
        return callback(null, true)
      }

      logger.warn({ origin: incomingOrigin }, 'CORS blocked origin')
      return callback(new Error(`Not allowed by CORS: ${incomingOrigin}`))
    },
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
}

export default createCorsMiddleware()
