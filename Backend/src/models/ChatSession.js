import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true, trim: true, maxlength: 1200 },
    createdAt: { type: Date, default: Date.now }
  },
  {
    _id: false
  }
);

const chatSessionSchema = new mongoose.Schema(
  {
    messages: {
      type: [chatMessageSchema],
      default: []
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

chatSessionSchema.index({ updatedAt: -1 });

export const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
