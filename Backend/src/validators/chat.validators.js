import { z } from 'zod';

export const chatPromptSchema = z.object({
  sessionId: z.string().trim().optional(),
  message: z
    .string()
    .trim()
    .min(1, 'Message is required')
    .max(1200, 'Message is too long'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().min(1).max(1200)
      })
    )
    .max(10)
    .optional()
    .default([])
});
