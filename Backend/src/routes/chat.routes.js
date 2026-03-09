import { Router } from 'express';
import { chatWithAssistant } from '../controllers/chatController.js';
import { chatRateLimiter } from '../middlewares/rateLimiter.js';

export const chatRouter = Router();

chatRouter.post('/', chatRateLimiter, chatWithAssistant);
