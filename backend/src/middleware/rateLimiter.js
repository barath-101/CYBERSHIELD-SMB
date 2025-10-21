const rateLimit = require('express-rate-limit');
const config = require('../config');

const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

const scanLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 scans per minute
  message: 'Too many scan requests, please slow down.',
});

module.exports = { apiLimiter, authLimiter, scanLimiter };
