const rolePermissions = require('../constants/rolePermissions')
const ApiError = require('../utils/apiError')

function permit(requiredPermissions = []) {
  return (req, _res, next) => {
    if (req.method === 'OPTIONS') return next()

    if (!req.user) {
      return next(new ApiError(401, 'Unauthorized'))
    }

    const userRole = req.user.role
    const allowed = rolePermissions[userRole] || []

    if (allowed.includes('*')) return next()

    const hasAll = requiredPermissions.every((p) => allowed.includes(p))

    if (!hasAll) {
      return next(new ApiError(403, 'Forbidden'))
    }

    return next()
  }
}

module.exports = permit
