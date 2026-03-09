import compression from 'compression';
import cors from 'cors';
import express from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import hpp from 'hpp';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { requestIdMiddleware } from './middlewares/requestId.js';
import { globalRateLimiter } from './middlewares/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { apiRouter } from './routes/index.js';

export const app = express();

app.set('trust proxy', 1);

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  if (env.CORS_ORIGINS.includes(origin)) {
    return true;
  }

  try {
    const parsed = new URL(origin);
    const host = parsed.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1') {
      return true;
    }

    // Allow Vercel production + preview origins for this app.
    if (host === 'anubhab-s-portfolio.vercel.app' || host.endsWith('.vercel.app')) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

app.use(requestIdMiddleware);
app.use(
  pinoHttp({
    logger,
    customProps: (req) => ({ requestId: req.requestId })
  })
);
app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origin not allowed by CORS'));
      }
    },
    credentials: false
  })
);
app.use(helmet());
app.use(compression());
app.use(globalRateLimiter);
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(mongoSanitize());
app.use(hpp());

app.get('/', (_req, res) => {
  res.json({
    success: true,
    service: 'portfolio-backend',
    status: 'ok'
  });
});

app.use('/api/v1', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);
