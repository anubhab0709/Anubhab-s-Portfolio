import { asyncHandler } from '../utils/asyncHandler.js';
import { contactSubmitSchema } from '../validators/contact.validators.js';
import { sendContactEmail } from '../services/contactEmailService.js';
import { ContactMessage } from '../models/ContactMessage.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

export const submitContactForm = asyncHandler(async (req, res) => {
  const payload = contactSubmitSchema.parse(req.body);

  // Honeypot field should remain empty for legitimate users.
  if (payload.company) {
    return res.status(200).json({
      success: true,
      message: 'Message received.'
    });
  }

  if (!env.SKIP_DB) {
    try {
      await ContactMessage.create({
        name: payload.name,
        email: payload.email,
        subject: payload.subject,
        message: payload.message,
        company: payload.company,
        sourceIp: req.ip,
        userAgent: req.get('user-agent') || ''
      });
    } catch (error) {
      logger.warn({ err: error }, 'Failed to save contact message');
    }
  }

  await sendContactEmail(payload);

  return res.status(200).json({
    success: true,
    message: 'Your message was sent successfully.'
  });
});
