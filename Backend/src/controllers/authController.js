import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { verifyGoogleIdToken } from '../services/googleTokenService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { guestbookDevLoginSchema, googleAuthSchema } from '../validators/guestbook.validators.js';
import { ApiError } from '../utils/ApiError.js';

export const googleAuthLogin = asyncHandler(async (req, res) => {
  const parsed = googleAuthSchema.parse(req.body);
  const credential = parsed.credential || parsed.idToken;
  const user = await verifyGoogleIdToken(credential);

  const token = jwt.sign(
    {
      sub: user.googleId,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN
    }
  );

  res.status(200).json({
    success: true,
    data: {
      token,
      user
    }
  });
});

export const guestbookDevLogin = asyncHandler(async (req, res) => {
  if (!env.ALLOW_GUESTBOOK_DEV_LOGIN) {
    throw new ApiError(403, 'Development guestbook login is disabled.');
  }

  const { name, email } = guestbookDevLoginSchema.parse(req.body);
  const normalizedEmail = email.toLowerCase();

  const token = jwt.sign(
    {
      sub: `dev:${normalizedEmail}`,
      email: normalizedEmail,
      name,
      avatarUrl: ''
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN
    }
  );

  res.status(200).json({
    success: true,
    data: {
      token,
      user: {
        googleId: `dev:${normalizedEmail}`,
        email: normalizedEmail,
        name,
        avatarUrl: ''
      }
    }
  });
});
