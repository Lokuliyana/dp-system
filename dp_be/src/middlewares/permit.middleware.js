const rolePermissions = require('../constants/rolePermissions')
const ApiError = require('../utils/apiError')

function permit(requiredPermissions = []) {
  return (req, _res, next) => {
    if (req.method === 'OPTIONS') return next()

    if (!req.user) {
      return next(new ApiError(401, 'Unauthorized'))
    }

    // Super Admin bypass
    if (req.user.role === 'superadmin') return next()

    const userPermissions = req.user.permissions || []
    
    // Check if user has ALL required permissions
    const hasAll = requiredPermissions.every((p) => userPermissions.includes(p))

    if (!hasAll) {
      return next(new ApiError(403, 'Forbidden'))
    }

    return next()
  }
}

module.exports = permit
