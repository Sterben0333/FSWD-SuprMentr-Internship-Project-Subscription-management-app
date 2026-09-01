const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');
const { maintenanceMiddleware } = require('../middlewares/maintenanceMiddleware');

router.use(authMiddleware, maintenanceMiddleware);
router.get('/', notificationController.list);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);

module.exports = router;
