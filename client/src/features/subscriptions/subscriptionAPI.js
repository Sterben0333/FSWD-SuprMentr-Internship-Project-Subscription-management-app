import api from '../../lib/axios';

export const subscriptionAPI = {
  list: (params) => api.get('/subscriptions', { params }),
  get: (id) => api.get(`/subscriptions/${id}`),
  create: (data) => api.post('/subscriptions', data),
  update: (id, data) => api.put(`/subscriptions/${id}`, data),
  delete: (id) => api.delete(`/subscriptions/${id}`),
};

export const categoryAPI = {
  list: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
};
