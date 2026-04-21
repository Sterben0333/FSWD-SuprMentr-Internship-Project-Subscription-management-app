const subscriptionService = require('../services/subscriptionService');

const list = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      categoryId: req.query.categoryId,
      search: req.query.search,
    };
    const subscriptions = await subscriptionService.listSubscriptions(req.userId, filters);
    res.json({ success: true, data: { subscriptions } });
  } catch (error) {
    next(error);
  }
};

const get = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.getSubscription(req.params.id, req.userId);
    res.json({ success: true, data: { subscription } });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.createSubscription(req.userId, req.body);
    res.status(201).json({ success: true, message: 'Subscription created', data: { subscription } });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.updateSubscription(req.params.id, req.userId, req.body);
    res.json({ success: true, message: 'Subscription updated', data: { subscription } });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await subscriptionService.deleteSubscription(req.params.id, req.userId);
    res.json({ success: true, message: 'Subscription deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { list, get, create, update, remove };
