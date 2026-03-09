import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    subject: { type: String, required: true, trim: true, maxlength: 160 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    company: { type: String, default: '', trim: true, maxlength: 120 },
    isRead: { type: Boolean, default: false },
    sourceIp: { type: String, default: '', trim: true, maxlength: 120 },
    userAgent: { type: String, default: '', trim: true, maxlength: 512 }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

contactMessageSchema.index({ createdAt: -1 });

export const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);