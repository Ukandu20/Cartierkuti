import express from 'express';
import cors from 'cors';
import path from 'path';
import { connectDB } from './config/db.js';
import projectRouter from './routes/project.router.js';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const app = express();
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// ─────────────── DB
connectDB();

// ─────────────── middleware
app.use(express.json()); // JSON body parser
app.use(
  cors({
    origin: process.env.CLIENT_URL?.split(',') || ['http://localhost:5173'], // allow multiple origins
    credentials: true,
  })
);

// ─────────────── API routes
app.use('/api/projects', projectRouter);

// ─────────────── static files
const publicFolder = path.join(__dirname, 'public');
app.use(express.static(publicFolder));

// Fallback for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(publicFolder, 'index.html'));
});

// Optional global error handler (if you created one)
import { errorHandler } from './middleware/errorhandler.js';
app.use(errorHandler);

// ─────────────── start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
