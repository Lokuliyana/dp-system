const authMiddleware = require('./auth.middleware');
const ApiError = require('../utils/apiError');

/**
 * Middleware to authenticate and check permissions.
 * Usage: authGuard('permission1', 'permission2')
 * Checks if user has ANY of the required permissions.
 */
const authGuard = (...requiredPermissions) => {
  return async (req, res, next) => {
    // 1. Run Authentication
    if (!req.user) {
      const runAuth = () => new Promise((resolve, reject) => {
         authMiddleware(req, res, (err) => {
           if (err) reject(err);
           else resolve();
         });
      });

      try {
        await runAuth();
      } catch (err) {
        return next(err);
      }
    }

    // Skip permission check for OPTIONS or public paths (if handled by authMiddleware)
    if (req.method === 'OPTIONS') return next();

    // 2. Run Authorization
    if (!requiredPermissions.length) {
      return next();
    }

    if (!req.user) {
       // If authMiddleware allowed it (e.g. public path) but permissions are required, return 401
       return next(new ApiError(401, 'Unauthorized'));
    }

    // Combine permissions: User permissions + Role permissions
    const rolePermissions = req.user.roleId?.permissions || [];
    const userPermissions = req.user.permissions || [];
    const allPermissions = [...new Set([...rolePermissions, ...userPermissions])];

    // Check permissions
    // Using 'some' implies if the user has ANY of the required permissions, they are allowed.
    const hasPermission = requiredPermissions.some(p => allPermissions.includes(p));

    if (!hasPermission) {
       return next(new ApiError(403, 'Forbidden: You do not have enough rights'));
    }

    next();
  };
};

module.exports = authGuard;
