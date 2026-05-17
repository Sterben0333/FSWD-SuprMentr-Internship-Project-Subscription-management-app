const notificationService = require('../services/notificationService');

const list = async (req, res, next) => {
  try {
    const unreadOnly = req.query.unreadOnly === 'true';
    const notifications = await notificationService.listNotifications(req.userId, { unreadOnly });
    const unreadCount = await notificationService.getUnreadCount(req.userId);
    res.json({ success: true, data: { notifications, unreadCount } });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    await notificationService.markAsRead(req.params.id, req.userId);
    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.userId);
    res.json({ success: true, message: 'All marked as read' });
  } catch (error) {
    next(error);
  }
};

module.exports = { list, markAsRead, markAllAsRead };
