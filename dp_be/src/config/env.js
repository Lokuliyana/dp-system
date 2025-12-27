require('dotenv').config()
const ApiError = require('../utils/apiError')

const required = [
  'MONGO_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET'
]

required.forEach((k) => {
  if (!process.env[k]) throw new ApiError(500, `Missing env: ${k}`)
})

if (!process.env.PORT && !process.env.SERVER_PORT) {
  // Warn or default, but Vercel/Heroku provide PORT.
  // For local dev, we expect PORT in .env
  console.warn('No PORT or SERVER_PORT defined in env, defaulting to 5000')
}

const nodeEnv = process.env.NODE_ENV || 'development'
const mongoUri = process.env.MONGO_URI || 
  (nodeEnv === 'production' ? process.env.MONGO_URI_CLUSTER : process.env.MONGO_URI_LOCAL)

if (!mongoUri) {
  throw new ApiError(500, 'Missing env: MONGO_URI or (MONGO_URI_LOCAL/MONGO_URI_CLUSTER)')
}

const env = {
  nodeEnv,
  port: Number(process.env.SERVER_PORT || process.env.PORT),
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  apiBaseUrl: process.env.API_BASE_URL || `http://localhost:${Number(process.env.PORT || 5000)}`,
  appName: process.env.APP_NAME || 'AnandaDp',

  mongoUri,
  mongoDbName: process.env.MONGO_DB_NAME || 'school_system',
  mongoPoolSize: Number(process.env.MONGO_POOL_SIZE || 10),

  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  saltRounds: Number(process.env.PASSWORD_SALT_ROUNDS || 12),
  encryptionKey: process.env.ENCRYPTION_KEY,

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  corsOrigins: (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 900000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 200),

  logLevel: process.env.LOG_LEVEL || 'info',

  promotionCron: process.env.PROMOTION_CRON,
  teamPipelineCron: process.env.TEAM_PIPELINE_CRON
}

module.exports = env
