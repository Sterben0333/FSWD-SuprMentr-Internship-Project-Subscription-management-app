const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const authMiddleware = require('../middlewares/authMiddleware');
const { maintenanceMiddleware } = require('../middlewares/maintenanceMiddleware');
const validate = require('../middlewares/validate');
const { createSubscriptionSchema, updateSubscriptionSchema } = require('../validators/subscriptionSchemas');

// All routes require authentication + maintenance check
router.use(authMiddleware, maintenanceMiddleware);

router.get('/', subscriptionController.list);
router.get('/:id', subscriptionController.get);
router.post('/', validate(createSubscriptionSchema), subscriptionController.create);
router.put('/:id', validate(updateSubscriptionSchema), subscriptionController.update);
router.delete('/:id', subscriptionController.remove);

module.exports = router;
