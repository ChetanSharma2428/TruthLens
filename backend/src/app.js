import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { env } from './config/env.js';
import claimRoutes from './routes/claimRoutes.js';
import reviewerRoutes from './routes/reviewerRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// Payload Compression (gzip / deflate for all JSON responses)
app.use(compression({ threshold: 0 }));

// Security Middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, tests)
      if (!origin) return callback(null, true);
      if (
        origin === env.FRONTEND_ORIGIN ||
        origin === 'http://localhost:5173' ||
        origin === 'http://127.0.0.1:5173' ||
        env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body Parsing & Cookies
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser(env.SESSION_SECRET));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === 'test' ? 10000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.'
    }
  }
});
app.use('/api', limiter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString()
    }
  });
});

// Client-side / CDN Cache-Control headers for public read-only requests
app.use((req, res, next) => {
  if (req.method === 'GET' && (req.originalUrl.startsWith('/api/claims') || req.originalUrl.startsWith('/api/stats'))) {
    res.set('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
  }
  next();
});

// Mounted API Routes
app.use('/api/claims', claimRoutes);
app.use('/api/reviewer', reviewerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/stats', statsRoutes);

// 404 & Central Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
