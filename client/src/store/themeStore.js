import { create } from 'zustand';

const useThemeStore = create((set) => ({
  theme: localStorage.getItem('theme') || 'dark',

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      return { theme: newTheme };
    });
  },

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },

  // Initialize theme on app load
  initTheme: () => {
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    set({ theme: saved });
  },
}));

export default useThemeStore;
