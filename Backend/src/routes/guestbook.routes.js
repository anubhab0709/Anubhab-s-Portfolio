import { Router } from 'express';
import {
  createGuestbookEntry,
  deleteOwnEntry,
  hideEntryAsAdmin,
  listGuestbookEntries,
  updateOwnEntry
} from '../controllers/guestbookController.js';
import { requireAdmin, requireAuth } from '../middlewares/auth.js';
import { writeRateLimiter } from '../middlewares/rateLimiter.js';

export const guestbookRouter = Router();

guestbookRouter.get('/', listGuestbookEntries);
guestbookRouter.post('/', requireAuth, writeRateLimiter, createGuestbookEntry);
guestbookRouter.patch('/:entryId', requireAuth, writeRateLimiter, updateOwnEntry);
guestbookRouter.delete('/:entryId', requireAuth, writeRateLimiter, deleteOwnEntry);
guestbookRouter.patch('/:entryId/hide', requireAuth, requireAdmin, writeRateLimiter, hideEntryAsAdmin);
