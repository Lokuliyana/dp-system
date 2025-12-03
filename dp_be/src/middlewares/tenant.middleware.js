const env = require('../config/env')

const PUBLIC_PATHS = [`${env.apiPrefix}/app-users/login`, `${env.apiPrefix}/app-users/refresh`]

module.exports = (req, _res, next) => {
  if (req.method === 'OPTIONS') return next()

  if (PUBLIC_PATHS.includes(req.path)) {
    req.schoolId = null
    return next()
  }

  if (req.user?.schoolId) {
    req.schoolId = req.user.schoolId
  } else {
    req.schoolId = null
  }

  return next()
}
