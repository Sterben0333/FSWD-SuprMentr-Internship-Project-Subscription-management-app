const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middlewares/authMiddleware');
const { maintenanceMiddleware } = require('../middlewares/maintenanceMiddleware');

router.use(authMiddleware, maintenanceMiddleware);
router.get('/', analyticsController.getAnalytics);

module.exports = router;
