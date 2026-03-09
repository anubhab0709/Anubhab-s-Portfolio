import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';

function toInputItems(history, userMessage) {
  const systemInstruction = env.OPENAI_CHAT_SYSTEM_PROMPT ||
    'You are a helpful assistant on Anubhab Bhattacharjee\'s portfolio website. Keep answers concise, professional, and relevant to the portfolio, projects, skills, and contact information.';

  const historyItems = history.flatMap((item) => {
    if (item.role === 'assistant') {
      return [
        {
          role: 'assistant',
          content: [{ type: 'input_text', text: item.content }]
        }
      ];
    }

    return [
      {
        role: 'user',
        content: [{ type: 'input_text', text: item.content }]
      }
    ];
  });

  return [
    {
      role: 'system',
      content: [{ type: 'input_text', text: systemInstruction }]
    },
    ...historyItems,
    {
      role: 'user',
      content: [{ type: 'input_text', text: userMessage }]
    }
  ];
}

function extractReply(payload) {
  if (typeof payload?.output_text === 'string' && payload.output_text.trim().length > 0) {
    return payload.output_text.trim();
  }

  const output = Array.isArray(payload?.output) ? payload.output : [];
  for (const item of output) {
    const contentParts = Array.isArray(item?.content) ? item.content : [];
    for (const part of contentParts) {
      if (part?.type === 'output_text' && typeof part.text === 'string' && part.text.trim().length > 0) {
        return part.text.trim();
      }
    }
  }

  return null;
}

async function callOpenAI({ apiKey, message, history }) {
  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL,
      input: toInputItems(history, message),
      max_output_tokens: 400
    })
  });

  const payload = await response.json().catch(() => ({}));
  return { response, payload };
}

export async function generatePortfolioChatReply({ message, history, apiKeyOverride }) {
  const overrideKey = typeof apiKeyOverride === 'string' ? apiKeyOverride.trim() : '';
  const envKey = typeof env.OPENAI_API_KEY === 'string' ? env.OPENAI_API_KEY.trim() : '';

  const candidateKeys = [];
  if (overrideKey) {
    candidateKeys.push({ key: overrideKey, source: 'override' });
  }
  if (envKey && envKey !== overrideKey) {
    candidateKeys.push({ key: envKey, source: 'env' });
  }

  if (candidateKeys.length === 0) {
    throw new ApiError(503, 'Chat assistant is not configured yet.');
  }

  let lastError = null;

  for (const candidate of candidateKeys) {
    if (!candidate.key.startsWith('sk-')) {
      lastError = new ApiError(400, 'Invalid OpenAI API key format provided.');
      continue;
    }

    const { response, payload } = await callOpenAI({
      apiKey: candidate.key,
      message,
      history
    });

    if (response.ok) {
      const reply = extractReply(payload);
      if (!reply) {
        throw new ApiError(502, 'OpenAI API returned an empty response.');
      }

      return reply;
    }

    const errorCode = payload?.error?.code;
    const isAuthError = response.status === 401;
    const isQuotaError = response.status === 429 || errorCode === 'insufficient_quota';

    if (isQuotaError) {
      lastError = new ApiError(
        503,
        'Chat is temporarily unavailable because the OpenAI API quota is exhausted. Please top up billing and try again.'
      );

      // If a user-provided key is exhausted, try backend env key before failing.
      if (candidate.source === 'override') {
        continue;
      }

      throw lastError;
    }

    if (isAuthError) {
      lastError = new ApiError(401, 'OpenAI API key is invalid or expired.');

      // If override key is invalid, fall back to env key automatically.
      if (candidate.source === 'override') {
        continue;
      }

      throw lastError;
    }

    const apiError = payload?.error?.message || 'Failed to get response from OpenAI API.';
    throw new ApiError(response.status, apiError);
  }

  throw lastError || new ApiError(503, 'Chat assistant is not configured yet.');
}
