import api from '../../lib/axios';

export const analyticsAPI = {
  get: () => api.get('/analytics'),
};

export const notificationAPI = {
  list: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};
