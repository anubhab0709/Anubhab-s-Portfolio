import mongoose from 'mongoose';
import { ChatSession } from '../models/ChatSession.js';

const MAX_HISTORY_FOR_MODEL = 10;
const MAX_MESSAGES_PER_SESSION = 40;

function normalizeHistory(messages) {
  return messages.slice(-MAX_HISTORY_FOR_MODEL).map((item) => ({
    role: item.role,
    content: item.content
  }));
}

function canUseDatabase() {
  return mongoose.connection.readyState === 1;
}

export async function resolveChatHistory({ sessionId, fallbackHistory }) {
  if (!canUseDatabase() || !sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
    return {
      history: fallbackHistory,
      resolvedSessionId: null
    };
  }

  const session = await ChatSession.findById(sessionId).lean();
  if (!session) {
    return {
      history: fallbackHistory,
      resolvedSessionId: null
    };
  }

  return {
    history: normalizeHistory(Array.isArray(session.messages) ? session.messages : []),
    resolvedSessionId: session._id.toString()
  };
}

export async function persistChatTurn({ sessionId, userMessage, assistantMessage }) {
  if (!canUseDatabase()) {
    return null;
  }

  let session = null;

  if (sessionId && mongoose.Types.ObjectId.isValid(sessionId)) {
    session = await ChatSession.findById(sessionId);
  }

  if (!session) {
    session = new ChatSession({ messages: [] });
  }

  session.messages.push(
    { role: 'user', content: userMessage },
    { role: 'assistant', content: assistantMessage }
  );

  if (session.messages.length > MAX_MESSAGES_PER_SESSION) {
    session.messages = session.messages.slice(-MAX_MESSAGES_PER_SESSION);
  }

  await session.save();
  return session._id.toString();
}
