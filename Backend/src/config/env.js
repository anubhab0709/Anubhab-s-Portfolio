import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(8080),
  MONGODB_URI: z.string().optional(),
  SKIP_DB: z
    .preprocess((value) => {
      if (typeof value !== 'string') {
        return false;
      }
      return value.toLowerCase() === 'true';
    }, z.boolean())
    .default(false),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long.'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4.1-mini'),
  OPENAI_CHAT_SYSTEM_PROMPT: z.string().optional(),
  ALLOW_GUESTBOOK_DEV_LOGIN: z
    .preprocess((value) => {
      if (typeof value !== 'string') {
        return undefined;
      }
      return value.toLowerCase() === 'true';
    }, z.boolean().optional())
    .optional(),
  ADMIN_EMAILS: z.string().optional(),
  CONTACT_TO_EMAIL: z.string().email().optional(),
  CONTACT_FROM_EMAIL: z.string().email().optional(),
  RESEND_API_KEY: z.string().optional(),
  LOG_REDACT_PATHS: z.string().optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const errors = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
  throw new Error(`Invalid environment variables:\n${errors}`);
}

const normalizedOrigins = parsed.data.CORS_ORIGINS.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const adminEmails = (parsed.data.ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const logRedactPaths = (parsed.data.LOG_REDACT_PATHS || '')
  .split(',')
  .map((path) => path.trim())
  .filter(Boolean);

export const env = {
  ...parsed.data,
  CORS_ORIGINS: normalizedOrigins,
  ADMIN_EMAILS: adminEmails,
  LOG_REDACT_PATHS: logRedactPaths,
  ALLOW_GUESTBOOK_DEV_LOGIN:
    typeof parsed.data.ALLOW_GUESTBOOK_DEV_LOGIN === 'boolean'
      ? parsed.data.ALLOW_GUESTBOOK_DEV_LOGIN
      : parsed.data.NODE_ENV !== 'production'
};
