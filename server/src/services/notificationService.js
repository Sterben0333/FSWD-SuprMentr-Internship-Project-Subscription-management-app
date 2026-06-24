const Notification = require('../models/Notification');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/*List notifications for a user*/
const listNotifications = async (userId, { unreadOnly = false } = {}) => {
  const query = { userId };
  if (unreadOnly) query.isRead = false;

  return Notification.find(query)
    .populate('subscriptionId', 'name')
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
};

/*to Get unread count*/
const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ userId, isRead: false });
};

/*to Mark notification as read*/
const markAsRead = async (id, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId },
    { isRead: true },
    { new: true }
  );
  if (!notification) throw ApiError.notFound('Notification not found');
  return notification;
};

/*toMark all as read*/
const markAllAsRead = async (userId) => {
  await Notification.updateMany({ userId, isRead: false }, { isRead: true });
};

/*Create a notification (used by cron jobs)*/
const createNotification = async (data) => {
  // Prevent duplicate notifications for the same event
  const existing = await Notification.findOne({
    userId: data.userId,
    subscriptionId: data.subscriptionId,
    type: data.type,
    triggerDate: data.triggerDate,
  });
  if (existing) return existing;

  return Notification.create(data);
};

module.exports = {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createNotification,
};
