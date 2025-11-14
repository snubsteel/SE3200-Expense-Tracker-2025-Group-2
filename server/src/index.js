import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import pool from './db.js';
import { errorHandler } from './middleware/error.js';
import { authRequired } from './middleware/authRequired.js';
import authRouter from './routes/auth.js';
import expensesRouter from './routes/expenses.js';

const app = express();

// Security-related middleware comes first so every request gets headers, CORS,
// and JSON parsing before it reaches any business logic.
app.use(helmet());
app.use(cors());
app.use(express.json());

// Tight rate limit just for auth endpoints to reduce brute-force attempts.
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: 'rate_limited',
        message: 'Too many authentication attempts. Please try again shortly.',
      },
    });
  },
});

// Health endpoint verifies database connectivity so ops can monitor readiness.
app.get('/health', async (req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    err.status = 503;
    err.code = 'database_unavailable';
    next(err);
  }
});

// Auth routes live under /api/auth and get a dedicated rate limiter.
app.use('/api/auth', authLimiter, authRouter);

// Expenses endpoints stay behind JWT auth so users only see their own data.
app.use('/api/expenses', authRequired, expensesRouter);

// Fallback ensures unknown routes respond cleanly once routers run.
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'not_found',
      message: 'Resource not found',
    },
  });
});

app.use(errorHandler);

const port = Number(process.env.PORT) || 4000;
// Start the HTTP server after middleware/routers are mounted so startup logs reflect readiness.
const server = app.listen(port, () => {
  console.log(`API listening on port ${port} (${process.env.NODE_ENV || 'development'})`);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('HTTP server closed');
  });
});
