import pino from 'pino';
import { env } from './env.js';

const isDevelopment = env.NODE_ENV === 'development';

const defaultRedactPaths = [
  'req.headers.authorization',
  'req.headers.x-openai-api-key',
  'req.headers.cookie',
  'req.body.credential',
  'req.body.password',
  'req.body.token',
  'req.body.RESEND_API_KEY',
  'res.headers.set-cookie'
];

const redactPaths = env.LOG_REDACT_PATHS.length > 0 ? env.LOG_REDACT_PATHS : defaultRedactPaths;

export const logger = pino({
  level: isDevelopment ? 'debug' : 'info',
  redact: {
    paths: redactPaths,
    remove: true
  },
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname'
        }
      }
    : undefined
});
