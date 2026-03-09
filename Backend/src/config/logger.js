import pino from 'pino';
import { createRequire } from 'module';
import { env } from './env.js';

const isDevelopment = env.NODE_ENV === 'development';
const require = createRequire(import.meta.url);

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

function getPrettyTransport() {
  if (!isDevelopment) {
    return undefined;
  }

  try {
    require.resolve('pino-pretty');
    return {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname'
      }
    };
  } catch {
    return undefined;
  }
}

export const logger = pino({
  level: isDevelopment ? 'debug' : 'info',
  redact: {
    paths: redactPaths,
    remove: true
  },
  transport: getPrettyTransport()
});
