const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// All admin routes require authentication + admin role
router.use(authMiddleware, adminMiddleware);

router.get('/stats', adminController.getStats);

module.exports = router;
