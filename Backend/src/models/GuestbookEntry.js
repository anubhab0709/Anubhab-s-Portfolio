import mongoose from 'mongoose';

const guestbookEntrySchema = new mongoose.Schema(
  {
    authorName: { type: String, required: true, trim: true, maxlength: 120 },
    authorEmail: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    authorGoogleId: { type: String, required: true, index: true },
    authorAvatarUrl: { type: String, default: '' },
    message: { type: String, required: true, trim: true, minlength: 1, maxlength: 500 },
    isHidden: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

guestbookEntrySchema.index({ createdAt: -1 });

export const GuestbookEntry = mongoose.model('GuestbookEntry', guestbookEntrySchema);
