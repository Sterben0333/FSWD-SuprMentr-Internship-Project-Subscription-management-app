const dashboardService = require('../services/dashboardService');

const getSummary = async (req, res, next) => {
  try {
    const summary = await dashboardService.getDashboardSummary(req.userId);
    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSummary };
