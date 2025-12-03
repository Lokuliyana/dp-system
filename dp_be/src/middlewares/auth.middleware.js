const jwt = require('jsonwebtoken')
const env = require('../config/env')
const ApiError = require('../utils/apiError')

const PUBLIC_PATHS = [`${env.apiPrefix}/app-users/login`, `${env.apiPrefix}/app-users/refresh`]

module.exports = (req, _res, next) => {
  // Always ignore preflight
  if (req.method === 'OPTIONS') return next()

  // Skip auth for public endpoints
  if (PUBLIC_PATHS.includes(req.path)) {
    req.user = null
    return next()
  }

  const header = req.headers.authorization

  if (!header?.startsWith('Bearer ')) {
    req.user = null
    return next()
  }

  const token = header.replace('Bearer ', '')

  try {
    const decoded = jwt.verify(token, env.jwtAccessSecret)
    req.user = decoded
    return next()
  } catch (err) {
    return next(new ApiError(401, 'Invalid or expired token'))
  }
}
