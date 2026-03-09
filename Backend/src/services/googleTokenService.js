import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

let oauthClient = null;

function getOauthClient() {
  if (!env.GOOGLE_CLIENT_ID) {
    throw new ApiError(503, 'Google OAuth is not configured yet.');
  }

  if (!oauthClient) {
    oauthClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);
  }

  return oauthClient;
}

export async function verifyGoogleIdToken(credential) {
  const client = getOauthClient();
  let ticket;

  try {
    ticket = await client.verifyIdToken({
      idToken: credential,
      audience: env.GOOGLE_CLIENT_ID
    });
  } catch (error) {
    const rawMessage = typeof error?.message === 'string' ? error.message : 'Google token verification failed';
    const lower = rawMessage.toLowerCase();

    if (lower.includes('audience') || lower.includes('wrong recipient') || lower.includes('invalid token')) {
      throw new ApiError(401, 'Google authorization failed. Check OAuth client configuration.', rawMessage);
    }

    throw new ApiError(401, 'Google authorization failed. Please sign in again.', rawMessage);
  }

  const payload = ticket.getPayload();

  if (!payload?.sub || !payload?.email) {
    throw new ApiError(401, 'Invalid Google credential');
  }

  if (!payload.email_verified) {
    throw new ApiError(403, 'Google email is not verified');
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name || payload.email,
    avatarUrl: payload.picture || ''
  };
}
