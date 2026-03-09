import { asyncHandler } from '../utils/asyncHandler.js';
import { chatPromptSchema } from '../validators/chat.validators.js';
import { generatePortfolioChatReply } from '../services/openaiChatService.js';
import { persistChatTurn, resolveChatHistory } from '../services/chatSessionService.js';

export const chatWithAssistant = asyncHandler(async (req, res) => {
  const payload = chatPromptSchema.parse(req.body);
  const rawHeaderKey = req.headers['x-openai-api-key'];
  const apiKeyOverride = Array.isArray(rawHeaderKey) ? rawHeaderKey[0] : rawHeaderKey;

  const { history, resolvedSessionId } = await resolveChatHistory({
    sessionId: payload.sessionId,
    fallbackHistory: payload.history
  });

  const reply = await generatePortfolioChatReply({
    message: payload.message,
    history,
    apiKeyOverride
  });

  const storedSessionId = await persistChatTurn({
    sessionId: resolvedSessionId || payload.sessionId,
    userMessage: payload.message,
    assistantMessage: reply
  });

  return res.status(200).json({
    success: true,
    data: {
      reply,
      sessionId: storedSessionId || resolvedSessionId || null
    }
  });
});
