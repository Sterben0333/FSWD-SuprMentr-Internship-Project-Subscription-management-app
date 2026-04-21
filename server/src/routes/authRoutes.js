const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema, updateProfileSchema } = require('../validators/authSchemas');

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

// Protected routes
router.get('/me', authMiddleware, authController.getMe);
router.put('/profile', authMiddleware, validate(updateProfileSchema), authController.updateProfile);

module.exports = router;
