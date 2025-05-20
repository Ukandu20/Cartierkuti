import 'express-async-errors';                  // NEW ➊
import express from 'express';
import cors    from 'cors';
import helmet  from 'helmet';                   // NEW ➋
import hpp     from 'hpp';                      // NEW ➋
import mongoSanitize from 'express-mongo-sanitize'; // NEW ➋
import rateLimit from 'express-rate-limit';     // NEW
import corsMiddleware from './config/cors.js'; 
import path from 'path';
import dotenv from 'dotenv';
import { connectDB }      from './config/db.js';
import projectRouter      from './routes/project.router.js';
import { errorHandler }   from './middleware/errorhandler.js';

dotenv.config();
const app = express();
const __dirname = path.dirname(new URL(import.meta.url).pathname);

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

/* ─────────── routes */
app.use('/api/projects', projectRouter);

/* ─────────── static & SPA fallback */
const publicFolder = path.join(__dirname, 'public');
app.use(express.static(publicFolder));
app.get('*', (_, res) =>
  res.sendFile(path.join(publicFolder, 'index.html'))
);

/* ─────────── error funnel */
app.use(errorHandler);

/* ─────────── start */
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`⇢ API up on ${PORT}`)
);

/* graceful shutdown */
['SIGTERM', 'SIGINT'].forEach(sig =>
  process.on(sig, async () => {
    console.log(`↧ ${sig} received, closing server…`);
    await mongoose.connection.close();
    server.close(() => process.exit(0));
  })
);
