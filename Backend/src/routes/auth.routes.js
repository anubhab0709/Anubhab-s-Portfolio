import { Router } from 'express';
import { googleAuthLogin, guestbookDevLogin } from '../controllers/authController.js';
import { authRateLimiter } from '../middlewares/rateLimiter.js';

export const authRouter = Router();

authRouter.post('/google', authRateLimiter, googleAuthLogin);
authRouter.post('/dev-login', authRateLimiter, guestbookDevLogin);
