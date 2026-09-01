import api from '../../lib/axios';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  deleteAccount: () => api.delete('/auth/account'),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getMaintenanceStatus: () => api.get('/admin/maintenance'),
  toggleMaintenance: (data) => api.put('/admin/maintenance', data),
};

export const maintenanceAPI = {
  getStatus: () => api.get('/maintenance/status'),
};

