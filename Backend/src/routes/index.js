import { Router } from 'express';
import mongoose from 'mongoose';
import { authRouter } from './auth.routes.js';
import { chatRouter } from './chat.routes.js';
import { contentRouter } from './content.routes.js';
import { contactRouter } from './contact.routes.js';
import { guestbookRouter } from './guestbook.routes.js';
import { adminRouter } from './admin.routes.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      mongo: mongoose.connection.readyState === 1 ? 'up' : 'down'
    }
  });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/content', contentRouter);
apiRouter.use('/guestbook', guestbookRouter);
apiRouter.use('/contact', contactRouter);
apiRouter.use('/chat', chatRouter);
apiRouter.use('/admin', adminRouter);
