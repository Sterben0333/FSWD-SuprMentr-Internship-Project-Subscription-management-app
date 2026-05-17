import { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { notificationAPI } from '../features/analytics/analyticsAPI';
import './NotificationCenter.css';

const typeIcons = {
  upcoming: '📅',
  overdue: '⚠️',
  budget_alert: '💸',
  trial_ending: '⏳',
  unused_sub: '💤',
};

const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await notificationAPI.list();
      setNotifications(data.data.notifications);
      setUnreadCount(data.data.unreadCount);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // for the Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="notification-wrap" ref={panelRef}>
      <button
        className="notification-bell btn-icon"
        onClick={() => setOpen(!open)}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notification-panel animate-fade-in-down">
          <div className="notification-panel-header">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-empty">
                <span className="spinner spinner-sm"></span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <span>🔕</span>
                <p className="text-muted text-sm">No notifications</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`notification-item ${n.isRead ? 'read' : 'unread'}`}
                  onClick={() => !n.isRead && handleMarkRead(n._id)}
                >
                  <span className="notification-type-icon">{typeIcons[n.type] || '📌'}</span>
                  <div className="notification-content">
                    <span className="notification-title">{n.title}</span>
                    <span className="notification-msg">{n.message}</span>
                    <span className="notification-time">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  {!n.isRead && <span className="notification-dot"></span>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
