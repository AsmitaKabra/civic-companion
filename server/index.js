import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import db from './database.js';

// Route Imports
import chatRouter from './routes/chat.js';
import complaintsRouter from './routes/complaints.js';
import schemesRouter from './routes/schemes.js';

const app = express();

// 1. Initialize DB
await db.init();

// 2. Security: Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  message: { error: 'Too many requests from this client. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 3. Middlewares
app.use(cors({
  origin: '*', // For development, allow all. In production, restrict this.
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '2mb' })); // Cap JSON requests size
app.use(globalLimiter);

// 4. Mount API Endpoints
app.use('/api/chat', chatRouter);
app.use('/api/complaints', complaintsRouter);
app.use('/api/schemes', schemesRouter);

// 5. Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', env: config.nodeEnv, timestamp: new Date().toISOString() });
});

// Serve frontend build in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../client/dist');

app.use(express.static(distPath));

// For SPA routing, direct unrecognized requests (non-API) to index.html
app.get(/^(?!\/api).+/, (req, res, next) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      next();
    }
  });
});

// 6. Security: Global Error Boundary (prevents backend stack trace leakage)
app.use((err, req, res, next) => {
  console.error('Unhandled Server Exception:', err);
  res.status(500).json({
    error: 'An unexpected security event or internal error occurred.',
    message: config.nodeEnv === 'development' ? err.message : 'Internal Server Error'
  });
});

// 7. Start Listening
const server = app.listen(config.port, () => {
  console.log(`====================================================`);
  console.log(` CivicCompanion API Server Running on Port ${config.port}`);
  console.log(` Environment: ${config.nodeEnv}`);
  console.log(`====================================================`);
});

export default app;
export { server };
