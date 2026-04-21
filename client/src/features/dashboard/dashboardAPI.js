import api from '../../lib/axios';

export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
};
