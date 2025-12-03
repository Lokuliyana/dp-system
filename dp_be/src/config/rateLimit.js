// src/config/rateLimit.js
const rateLimit = require('express-rate-limit')
const env = require('./env')

const limiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
})

module.exports = limiter
