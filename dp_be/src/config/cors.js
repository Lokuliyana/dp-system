// src/config/cors.js
const corsLib = require('cors')

const cors = corsLib({
  origin: true, // allow any origin in dev
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
})

module.exports = cors
