import { Router } from 'express';
import { submitContactForm } from '../controllers/contactController.js';
import { contactRateLimiter } from '../middlewares/rateLimiter.js';

export const contactRouter = Router();

contactRouter.post('/', contactRateLimiter, submitContactForm);
