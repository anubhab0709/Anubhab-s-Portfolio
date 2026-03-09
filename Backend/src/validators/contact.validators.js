import { z } from 'zod';

export const contactSubmitSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(120, 'Name is too long'),
  email: z.string().trim().email('Valid email is required').max(254),
  subject: z.string().trim().min(3, 'Subject is required').max(160, 'Subject is too long'),
  message: z.string().trim().min(10, 'Message is too short').max(2000, 'Message is too long'),
  company: z.string().trim().max(120).optional().default('')
});
