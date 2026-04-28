import './config/env.js'
import 'express-async-errors'
import path from 'path'
import express from 'express'
import helmet from 'helmet'
import hpp from 'hpp'
import mongoSanitize from 'express-mongo-sanitize'
import rateLimit from 'express-rate-limit'
import pinoHttp from 'pino-http'
import corsMiddleware from './config/cors.js'
import logger from './logger.js'
import projectRouter from './routes/project.router.js'
import activitiesRouter from './routes/activities.router.js'
import resumeRouter from './routes/resume.router.js'
import adminRouter from './routes/admin.router.js'
import { errorHandler, notFoundHandler } from './middleware/errorhandler.js'

const app = express()

app.use(pinoHttp({ logger }))
app.use(helmet())
app.use(hpp())
app.use(mongoSanitize())
app.use(express.json({ limit: '1mb' }))
app.use(corsMiddleware)

const apiLimiter = rateLimit({ windowMs: 60_000, max: 150 })
app.use('/api/', apiLimiter)

app.get('/health', (_req, res) => {
  logger.info('Healthcheck OK')
  res.sendStatus(200)
})

app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')))

app.use('/api/admin', adminRouter)
app.use('/api/projects', projectRouter)
app.use('/api/activities', activitiesRouter)
app.use('/api/resume', resumeRouter)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
