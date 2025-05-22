import 'express-async-errors';                  
import express from 'express';
import cors    from 'cors';
import helmet  from 'helmet';
import mongoose from 'mongoose';                   
import hpp     from 'hpp';                      
import mongoSanitize from 'express-mongo-sanitize'; 
import rateLimit from 'express-rate-limit';     
import corsMiddleware from './config/cors.js'; 
import path from 'path';
import dotenv from 'dotenv';
import pinoHttp from 'pino-http';
import logger from './logger.js';                       // ← import logger
import { connectDB }      from './config/db.js';
import projectRouter      from './routes/project.router.js';
import { errorHandler }   from './middleware/errorhandler.js';

dotenv.config();
const app = express();
const __dirname = path.dirname(new URL(import.meta.url).pathname);

/* ─────────── attach request logger ───────────────────────── */
app.use(pinoHttp({ logger }));

/* ─────────── DB */
await connectDB();

/* ─────────── global middleware */
app.use(helmet());
app.use(hpp());
app.use(mongoSanitize());
app.use(express.json());

// centralized CORS
app.use(corsMiddleware);

/* ─────────── rate-limit for bots */
const apiLimiter = rateLimit({ windowMs: 60_000, max: 150 });
app.use('/api/', apiLimiter);

// ─────────── healthcheck ────────────────────────────────
app.get('/health', (_req, res) => {
  logger.info('Healthcheck OK');
  res.sendStatus(200);
});

/* ─────────── routes */
app.use('/api/projects', projectRouter);



/* ─────────── error funnel */
app.use(errorHandler);

/* ─────────── start */
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  logger.info(`API up on ${PORT}`)
);

/* graceful shutdown */
['SIGTERM', 'SIGINT'].forEach(sig =>
  process.on(sig, async () => {
    logger.info(`↧ ${sig} received, closing server…`);
    await mongoose.connection.close();
    server.close(() => process.exit(0));
  })
);
