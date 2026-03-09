import { Router } from 'express';
import {
  deleteContactMessageAdmin,
  deleteGuestbookEntryAdmin,
  listContactMessagesAdmin,
  listGuestbookEntriesAdmin,
  updateContactReadStatusAdmin,
  updateGuestbookVisibilityAdmin
} from '../controllers/adminController.js';
import { getAdminContent, updateAdminContent } from '../controllers/contentController.js';
import { requireAdmin, requireAuth } from '../middlewares/auth.js';
import { writeRateLimiter } from '../middlewares/rateLimiter.js';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/content', getAdminContent);
adminRouter.put('/content', writeRateLimiter, updateAdminContent);

adminRouter.get('/guestbook', listGuestbookEntriesAdmin);
adminRouter.patch('/guestbook/:entryId/visibility', writeRateLimiter, updateGuestbookVisibilityAdmin);
adminRouter.delete('/guestbook/:entryId', writeRateLimiter, deleteGuestbookEntryAdmin);

adminRouter.get('/contacts', listContactMessagesAdmin);
adminRouter.patch('/contacts/:messageId/read', writeRateLimiter, updateContactReadStatusAdmin);
adminRouter.delete('/contacts/:messageId', writeRateLimiter, deleteContactMessageAdmin);