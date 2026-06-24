const ApiError = require('../utils/ApiError');

/**
 * Middleware to restrict access to admin users only.
 * Must be used AFTER authMiddleware (which sets req.userRole).
 */
const adminMiddleware = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return next(ApiError.forbidden('Admin access required'));
  }
  next();
};

module.exports = adminMiddleware;
