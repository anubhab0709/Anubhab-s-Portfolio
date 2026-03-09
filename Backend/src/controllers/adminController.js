import { ContactMessage } from '../models/ContactMessage.js';
import { GuestbookEntry } from '../models/GuestbookEntry.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  adminContactReadSchema,
  adminGuestbookListQuerySchema,
  adminGuestbookVisibilitySchema,
  adminListQuerySchema
} from '../validators/admin.validators.js';

export const listGuestbookEntriesAdmin = asyncHandler(async (req, res) => {
  const { page, limit, includeHidden, search } = adminGuestbookListQuerySchema.parse(req.query);
  const skip = (page - 1) * limit;

  const query = {
    ...(includeHidden ? {} : { isHidden: false }),
    ...(search
      ? {
          $or: [
            { authorName: { $regex: search, $options: 'i' } },
            { authorEmail: { $regex: search, $options: 'i' } },
            { message: { $regex: search, $options: 'i' } }
          ]
        }
      : {})
  };

  const [total, items] = await Promise.all([
    GuestbookEntry.countDocuments(query),
    GuestbookEntry.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()
  ]);

  res.status(200).json({
    success: true,
    data: {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});

export const updateGuestbookVisibilityAdmin = asyncHandler(async (req, res) => {
  const { entryId } = req.params;
  const { isHidden } = adminGuestbookVisibilitySchema.parse(req.body);

  const updated = await GuestbookEntry.findByIdAndUpdate(entryId, { isHidden }, { new: true }).lean();
  if (!updated) {
    throw new ApiError(404, 'Guestbook entry not found');
  }

  res.status(200).json({
    success: true,
    message: 'Guestbook visibility updated successfully',
    data: updated
  });
});

export const deleteGuestbookEntryAdmin = asyncHandler(async (req, res) => {
  const { entryId } = req.params;
  const deleted = await GuestbookEntry.findByIdAndDelete(entryId).lean();

  if (!deleted) {
    throw new ApiError(404, 'Guestbook entry not found');
  }

  res.status(200).json({
    success: true,
    message: 'Guestbook entry deleted successfully'
  });
});

export const listContactMessagesAdmin = asyncHandler(async (req, res) => {
  const { page, limit, search } = adminListQuerySchema.parse(req.query);
  const skip = (page - 1) * limit;

  const query = search
    ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { subject: { $regex: search, $options: 'i' } },
          { message: { $regex: search, $options: 'i' } }
        ]
      }
    : {};

  const [total, items] = await Promise.all([
    ContactMessage.countDocuments(query),
    ContactMessage.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()
  ]);

  res.status(200).json({
    success: true,
    data: {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});

export const updateContactReadStatusAdmin = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { isRead } = adminContactReadSchema.parse(req.body);

  const updated = await ContactMessage.findByIdAndUpdate(messageId, { isRead }, { new: true }).lean();
  if (!updated) {
    throw new ApiError(404, 'Contact message not found');
  }

  res.status(200).json({
    success: true,
    message: 'Contact message status updated successfully',
    data: updated
  });
});

export const deleteContactMessageAdmin = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const deleted = await ContactMessage.findByIdAndDelete(messageId).lean();

  if (!deleted) {
    throw new ApiError(404, 'Contact message not found');
  }

  res.status(200).json({
    success: true,
    message: 'Contact message deleted successfully'
  });
});