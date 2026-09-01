const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');
const { maintenanceMiddleware } = require('../middlewares/maintenanceMiddleware');

router.use(authMiddleware, maintenanceMiddleware);
router.get('/summary', dashboardController.getSummary);

module.exports = router;
