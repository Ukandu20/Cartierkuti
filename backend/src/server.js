// src/server.js

// ──────────── Load env-file early ─────────────────────────
import path from 'path';
import dotenv from 'dotenv';
// pick file based on NODE_ENV
const envFile =
  process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// ──────────── Core imports ─────────────────────────────────
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import corsMiddleware from './config/cors.js';
import pinoHttp from 'pino-http';
import logger from './logger.js';
import { connectDB } from './config/db.js';
import projectRouter from './routes/project.router.js';
import { errorHandler } from './middleware/errorhandler.js';

const app = express();

// ──────────── Attach request logger ────────────────────────
app.use(pinoHttp({ logger }));

// ──────────── Connect to MongoDB ──────────────────────────
await connectDB();

// ──────────── Global security middleware ──────────────────
app.use(helmet());
app.use(hpp());
app.use(mongoSanitize());
app.use(express.json());

// ──────────── CORS ────────────────────────────────────────
app.use(corsMiddleware);

// ──────────── Rate limiting ───────────────────────────────
const apiLimiter = rateLimit({ windowMs: 60_000, max: 150 });
app.use('/api/', apiLimiter);

// ──────────── Healthcheck ─────────────────────────────────
app.get('/health', (_req, res) => {
  logger.info('Healthcheck OK');
  res.sendStatus(200);
});

// ──────────── Serve uploaded preview images ────────────────
app.use(
  '/uploads',
  express.static(path.join(process.cwd(), 'public', 'uploads'))
);

// ──────────── Main project routes ─────────────────────────
app.use('/api/projects', projectRouter);

// ──────────── Centralized error handler ───────────────────
app.use(errorHandler);

// ──────────── Start server ────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  logger.info(`API up on port ${PORT} in ${process.env.NODE_ENV} mode`)
);

// ──────────── Graceful shutdown ───────────────────────────
['SIGTERM', 'SIGINT'].forEach((sig) =>
  process.on(sig, async () => {
    logger.info(`↧ ${sig} received, closing server…`);
    await mongoose.connection.close();
    server.close(() => process.exit(0));
  })
);
