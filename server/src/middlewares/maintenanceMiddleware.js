const MaintenanceMode = require('../models/MaintenanceMode');

// In-memory cache to avoid hitting DB on every request
let cachedStatus = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 10_000; // 10 seconds

/**
 * Refresh the in-memory cache from the database.
 */
const refreshCache = async () => {
  const now = Date.now();
  if (cachedStatus && now < cacheExpiry) {
    return cachedStatus;
  }

  try {
    const doc = await MaintenanceMode.getStatus();
    cachedStatus = {
      isEnabled: doc.isEnabled,
      message: doc.message,
    };
    cacheExpiry = now + CACHE_TTL_MS;
  } catch {
    // If DB query fails, assume maintenance is OFF to avoid locking everyone out
    cachedStatus = { isEnabled: false, message: '' };
    cacheExpiry = now + CACHE_TTL_MS;
  }

  return cachedStatus;
};

/**
 * Force-clear the cache (called when admin toggles maintenance mode).
 */
const invalidateCache = () => {
  cachedStatus = null;
  cacheExpiry = 0;
};

/**
 * Middleware: blocks non-admin users when maintenance mode is enabled.
 * Must be used AFTER authMiddleware (which sets req.userRole).
 */
const maintenanceMiddleware = async (req, res, next) => {
  try {
    const status = await refreshCache();

    if (status.isEnabled && req.userRole !== 'admin') {
      return res.status(503).json({
        success: false,
        maintenanceMode: true,
        message: status.message || 'The application is currently undergoing maintenance. Please try again later.',
      });
    }

    next();
  } catch {
    // Fail open — don't block users if the check itself fails
    next();
  }
};

module.exports = { maintenanceMiddleware, invalidateCache };
