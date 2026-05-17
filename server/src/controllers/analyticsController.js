const analyticsService = require('../services/analyticsService');

const getAnalytics = async (req, res, next) => {
  try {
    const data = await analyticsService.getAnalytics(req.userId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalytics };
