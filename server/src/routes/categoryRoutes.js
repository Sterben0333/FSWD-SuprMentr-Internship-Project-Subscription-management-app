const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/authMiddleware');
const { maintenanceMiddleware } = require('../middlewares/maintenanceMiddleware');

router.use(authMiddleware, maintenanceMiddleware);

router.get('/', categoryController.list);
router.post('/', categoryController.create);

module.exports = router;
