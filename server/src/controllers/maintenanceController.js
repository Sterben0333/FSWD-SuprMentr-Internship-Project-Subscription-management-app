const MaintenanceMode = require('../models/MaintenanceMode');
const { invalidateCache } = require('../middlewares/maintenanceMiddleware');

/**
 * GET /api/maintenance/status — Public (no auth required)
 * Returns the current maintenance mode status.
 */
const getPublicStatus = async (req, res, next) => {
  try {
    const doc = await MaintenanceMode.getStatus();
    res.json({
      success: true,
      data: {
        isEnabled: doc.isEnabled,
        message: doc.message || '',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/maintenance — Admin only
 * Returns full maintenance mode details.
 */
const getMaintenanceStatus = async (req, res, next) => {
  try {
    const doc = await MaintenanceMode.getStatus();
    res.json({
      success: true,
      data: {
        isEnabled: doc.isEnabled,
        message: doc.message || '',
        enabledAt: doc.enabledAt,
        enabledBy: doc.enabledBy,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/maintenance — Admin only
 * Toggle maintenance mode on or off.
 * Body: { isEnabled: boolean, message?: string }
 */
const toggleMaintenance = async (req, res, next) => {
  try {
    const { isEnabled, message } = req.body;

    if (typeof isEnabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isEnabled must be a boolean',
      });
    }

    const doc = await MaintenanceMode.toggle(isEnabled, message, req.userEmail);

    // Invalidate the middleware cache so the change takes effect immediately
    invalidateCache();

    res.json({
      success: true,
      message: isEnabled ? 'Maintenance mode enabled' : 'Maintenance mode disabled',
      data: {
        isEnabled: doc.isEnabled,
        message: doc.message || '',
        enabledAt: doc.enabledAt,
        enabledBy: doc.enabledBy,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPublicStatus, getMaintenanceStatus, toggleMaintenance };
