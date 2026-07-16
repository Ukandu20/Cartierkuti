import { validateEnvironment } from './config/env.js'
import mongoose from 'mongoose'
import app from './app.js'
import logger from './logger.js'
import { connectDB } from './config/db.js'

validateEnvironment()
await connectDB()

const PORT = process.env.PORT || 5000
const server = app.listen(PORT, () =>
  logger.info(`API up on port ${PORT} in ${process.env.NODE_ENV} mode`)
)

for (const sig of ['SIGTERM', 'SIGINT']) {
  process.on(sig, async () => {
    logger.info(`${sig} received, closing server`)
    await mongoose.connection.close()
    server.close(() => process.exit(0))
  })
}
