import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor, attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 (expired/invalid token) and 503 (maintenance mode)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // for to Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Maintenance mode — redirect non-admin users
    if (error.response?.status === 503 && error.response?.data?.maintenanceMode) {
      // Dynamically import to avoid circular dependencies
      const store = (await import('../store/maintenanceStore')).default;
      store.getState().setMaintenanceMode(true, error.response.data.message);

      if (window.location.pathname !== '/maintenance') {
        window.location.href = '/maintenance';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
