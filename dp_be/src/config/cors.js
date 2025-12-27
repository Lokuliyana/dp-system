// src/config/cors.js
const corsLib = require('cors')

const env = require('./env')

const cors = corsLib({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)

    // If CORS_ORIGINS is not defined or empty, allow all (dev mode behavior)
    if (!env.corsOrigins || env.corsOrigins.length === 0) {
      return callback(null, true)
    }

    if (env.corsOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
})

module.exports = cors
