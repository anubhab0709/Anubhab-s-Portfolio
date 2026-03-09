import { z } from 'zod';

const httpUrlSchema = z.string().trim().url('Must be a valid URL').max(2048);

export const adminLinkSchema = z.object({
  label: z.string().trim().min(1, 'Label is required').max(120),
  href: httpUrlSchema
});

export const adminResumeSchema = z.object({
  label: z.string().trim().min(1, 'Resume label is required').max(120),
  href: httpUrlSchema,
  isPrimary: z.boolean().default(false)
});

export const adminProjectSchema = z.object({
  id: z.string().trim().min(1, 'Project id is required').max(120),
  title: z.string().trim().min(1, 'Title is required').max(200),
  period: z.string().trim().min(1, 'Period is required').max(120),
  summary: z.string().trim().min(1, 'Summary is required').max(600),
  about: z.string().trim().min(1, 'About is required').max(4000),
  category: z.array(z.string().trim().min(1).max(60)).default([]),
  metrics: z.array(z.string().trim().min(1).max(160)).default([]),
  stack: z.array(z.string().trim().min(1).max(80)).default([]),
  photos: z.array(httpUrlSchema).default([]),
  github: httpUrlSchema,
  liveDemo: httpUrlSchema,
  link: httpUrlSchema
});

export const adminUpdateContentSchema = z.object({
  projects: z.array(adminProjectSchema).default([]),
  socialLinks: z.array(adminLinkSchema).default([]),
  resumes: z.array(adminResumeSchema).default([])
});

export const adminListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(160).optional().default('')
});

export const adminGuestbookListQuerySchema = adminListQuerySchema.extend({
  includeHidden: z
    .preprocess((value) => {
      if (typeof value !== 'string') {
        return undefined;
      }
      return value.toLowerCase() === 'true';
    }, z.boolean().optional())
    .optional()
});

export const adminGuestbookVisibilitySchema = z.object({
  isHidden: z.boolean()
});

export const adminContactReadSchema = z.object({
  isRead: z.boolean()
});