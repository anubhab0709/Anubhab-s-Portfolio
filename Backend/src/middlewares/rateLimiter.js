import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const isProduction = env.NODE_ENV === 'production';

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  }
});

export const authRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.'
  }
});

export const writeRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Rate limit exceeded for write operations. Please slow down.'
  }
});

export const contactRateLimiter = rateLimit({
  windowMs: isProduction ? 10 * 60 * 1000 : 60 * 1000,
  max: isProduction ? 10 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many contact submissions. Please try again later.'
  }
});

export const chatRateLimiter = rateLimit({
  windowMs: isProduction ? 10 * 60 * 1000 : 60 * 1000,
  max: isProduction ? 30 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many chat requests. Please slow down and try again shortly.'
  }
});
