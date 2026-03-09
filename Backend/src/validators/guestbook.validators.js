import { z } from 'zod';

export const googleAuthSchema = z
  .object({
    credential: z.string().trim().min(10).optional(),
    idToken: z.string().trim().min(10).optional()
  })
  .refine((value) => Boolean(value.credential || value.idToken), {
    message: 'Google credential is required',
    path: ['credential']
  });

export const guestbookDevLoginSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  email: z.string().trim().email('Valid email is required').max(254)
});

export const guestbookCreateSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(500, 'Message cannot exceed 500 characters')
});

export const guestbookListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20)
});
