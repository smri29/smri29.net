const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const TURNSTILE_GATE_HEADER = 'x-turnstile-gate-token';
const TURNSTILE_GATE_TYPE = 'turnstile_gate';

const hasTurnstileConfig = () =>
  Boolean(process.env.TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY);

const getAllowedOrigins = () =>
  [
    'http://localhost:5173',
    'https://smri29net.vercel.app',
    'https://smri29.net',
    process.env.FRONTEND_URL,
  ]
    .filter(Boolean)
    .map((origin) => String(origin).trim());

const getClientIp = (req) =>
  String(
    req.headers['cf-connecting-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.ip ||
    ''
  );

const securityHeaders = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
});

const buildLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => getClientIp(req) || 'unknown',
    message: { message },
  });

const authRateLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts. Please try again later.',
});

const publicWriteRateLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: 'Too many requests from this IP. Please slow down and try again later.',
});

const analyticsRateLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Analytics request rate limit exceeded.',
});

const adminRateLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 400,
  message: 'Too many admin requests from this IP.',
});

const isDangerousKey = (key) => {
  const normalized = String(key || '');
  return (
    normalized === '__proto__' ||
    normalized === 'constructor' ||
    normalized === 'prototype' ||
    normalized.startsWith('$') ||
    normalized.includes('.')
  );
};

const containsDangerousShape = (value) => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  if (Array.isArray(value)) {
    return value.some((item) => containsDangerousShape(item));
  }

  return Object.entries(value).some(([key, nestedValue]) => {
    if (isDangerousKey(key)) {
      return true;
    }

    return containsDangerousShape(nestedValue);
  });
};

const rejectSuspiciousPayload = (req, res, next) => {
  const sources = [req.body, req.query];
  const hasDangerousPayload = sources.some((source) => containsDangerousShape(source));
  if (hasDangerousPayload) {
    return res.status(400).json({ message: 'Request payload contains disallowed fields' });
  }

  return next();
};

const requireAllowedOrigin = (req, res, next) => {
  const allowedOrigins = getAllowedOrigins();
  const origin = String(req.headers.origin || '').trim();
  const referer = String(req.headers.referer || '').trim();

  if (origin && allowedOrigins.includes(origin)) {
    return next();
  }

  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      if (allowedOrigins.includes(refererOrigin)) {
        return next();
      }
    } catch {
      return res.status(403).json({ message: 'Request origin is not allowed' });
    }
  }

  return res.status(403).json({ message: 'Request origin is not allowed' });
};

const requireTurnstileGate = (req, res, next) => {
  if (!hasTurnstileConfig()) {
    return next();
  }

  const token = String(req.headers[TURNSTILE_GATE_HEADER] || '').trim();
  if (!token) {
    return res.status(403).json({ message: 'Human verification is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded?.type !== TURNSTILE_GATE_TYPE) {
      return res.status(403).json({ message: 'Human verification is invalid' });
    }

    req.turnstileGate = decoded;
    return next();
  } catch (error) {
    return res.status(403).json({ message: 'Human verification has expired or is invalid' });
  }
};

module.exports = {
  securityHeaders,
  authRateLimiter,
  publicWriteRateLimiter,
  analyticsRateLimiter,
  adminRateLimiter,
  rejectSuspiciousPayload,
  requireAllowedOrigin,
  requireTurnstileGate,
};
