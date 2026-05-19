const express = require('express');
const router = express.Router();
const { runAllDailyJobs } = require('../jobs/lifecycleJobs');

/**
 * POST /api/cron/daily
 * Secured endpoint for external cron services (e.g., cron-job.org, Render Cron Job).
 * Expects: Authorization: Bearer <CRON_SECRET>
 */
router.post('/daily', async (req, res) => {
  // ── Auth check ──
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || req.headers.authorization !== expected) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  // ── Run jobs ──
  try {
    await runAllDailyJobs();
    return res.status(200).json({
      success: true,
      message: 'Daily jobs completed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Daily jobs failed',
      error: error.message,
    });
  }
});

module.exports = router;
