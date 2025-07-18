// config/cors.js
import cors from 'cors';

// Read CLIENT_URL (comma-separated) from env, or fall back to sensible defaults:
const raw = process.env.CLIENT_URL || ''
const allowedOrigins = raw
  .split(',')
  .map(o => o.trim())
  .filter(o => o.length > 0)
  // if you want a default fallback when none is set:
  .concat(['http://localhost:5173']);

// Build our CORS options
const corsOptions = {
  origin: (incomingOrigin, callback) => {
    // allow non-browser requests (curl, mobile apps)
    if (!incomingOrigin || allowedOrigins.includes(incomingOrigin)) {
      return callback(null, true);
    }
    console.warn(`CORS blocked for origin: ${incomingOrigin}`);
    callback(new Error(`Not allowed by CORS: ${incomingOrigin}`));
  },
  credentials: true,  // Access-Control-Allow-Credentials
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization', 'x-admin-secret'],
};

export default cors(corsOptions);
