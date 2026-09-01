const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');

// Public — no auth required
router.get('/status', maintenanceController.getPublicStatus);

module.exports = router;
