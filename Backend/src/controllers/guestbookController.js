import { GuestbookEntry } from '../models/GuestbookEntry.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { guestbookCreateSchema, guestbookListQuerySchema } from '../validators/guestbook.validators.js';

export const listGuestbookEntries = asyncHandler(async (req, res) => {
  const { page, limit } = guestbookListQuerySchema.parse(req.query);
  const skip = (page - 1) * limit;

  const [total, items] = await Promise.all([
    GuestbookEntry.countDocuments({ isHidden: false }),
    GuestbookEntry.find({ isHidden: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
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

export const createGuestbookEntry = asyncHandler(async (req, res) => {
  const { message } = guestbookCreateSchema.parse(req.body);

  const created = await GuestbookEntry.create({
    authorName: req.user.name,
    authorEmail: req.user.email,
    authorGoogleId: req.user.sub,
    authorAvatarUrl: req.user.avatarUrl || '',
    message
  });

  res.status(201).json({
    success: true,
    data: created
  });
});

export const updateOwnEntry = asyncHandler(async (req, res) => {
  const { entryId } = req.params;
  const { message } = guestbookCreateSchema.parse(req.body);

  const entry = await GuestbookEntry.findById(entryId);
  if (!entry) {
    throw new ApiError(404, 'Guestbook entry not found');
  }

  if (entry.authorGoogleId !== req.user.sub) {
    throw new ApiError(403, 'You can only edit your own entries');
  }

  entry.message = message;
  await entry.save();

  res.status(200).json({
    success: true,
    data: entry
  });
});

export const deleteOwnEntry = asyncHandler(async (req, res) => {
  const { entryId } = req.params;

  const entry = await GuestbookEntry.findById(entryId);
  if (!entry) {
    throw new ApiError(404, 'Guestbook entry not found');
  }

  if (entry.authorGoogleId !== req.user.sub) {
    throw new ApiError(403, 'You can only delete your own entries');
  }

  await entry.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Entry deleted successfully'
  });
});

export const hideEntryAsAdmin = asyncHandler(async (req, res) => {
  const { entryId } = req.params;
  const entry = await GuestbookEntry.findById(entryId);

  if (!entry) {
    throw new ApiError(404, 'Guestbook entry not found');
  }

  entry.isHidden = true;
  await entry.save();

  res.status(200).json({
    success: true,
    message: 'Entry hidden successfully'
  });
});
