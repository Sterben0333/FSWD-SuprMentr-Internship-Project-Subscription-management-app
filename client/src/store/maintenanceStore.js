import { create } from 'zustand';
import api from '../lib/axios';

const useMaintenanceStore = create((set) => ({
  isMaintenanceMode: false,
  message: '',
  isLoading: false,

  /**
   * Check maintenance status from the public API endpoint.
   */
  checkMaintenanceStatus: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/maintenance/status');
      set({
        isMaintenanceMode: data.data.isEnabled,
        message: data.data.message || '',
        isLoading: false,
      });
      return data.data;
    } catch {
      set({ isLoading: false });
      return { isEnabled: false, message: '' };
    }
  },

  /**
   * Set maintenance mode state directly (used by axios interceptor).
   */
  setMaintenanceMode: (isEnabled, message = '') => {
    set({ isMaintenanceMode: isEnabled, message });
  },
}));

export default useMaintenanceStore;
