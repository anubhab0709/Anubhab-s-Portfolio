import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export function requireAuth(req, _res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, 'Authentication required'));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
}

export function requireAdmin(req, _res, next) {
  if (!req.user?.email || !env.ADMIN_EMAILS.includes(req.user.email.toLowerCase())) {
    return next(new ApiError(403, 'Admin access required'));
  }
  return next();
}
