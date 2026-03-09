import crypto from 'node:crypto';

export function requestIdMiddleware(req, res, next) {
  const headerValue = req.headers['x-request-id'];
  const requestId = typeof headerValue === 'string' && headerValue.trim() ? headerValue.trim() : crypto.randomUUID();

  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
}
