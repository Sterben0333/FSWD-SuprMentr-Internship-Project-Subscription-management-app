import { create } from 'zustand';

const useSubscriptionStore = create((set) => ({
  subscriptions: [],
  isLoading: false,
  error: null,
  filter: {
    status: 'all',
    categoryId: 'all',
    search: '',
  },

  setSubscriptions: (subscriptions) => set({ subscriptions, error: null }),

  addSubscription: (subscription) =>
    set((state) => ({
      subscriptions: [subscription, ...state.subscriptions],
    })),

  updateSubscription: (id, updated) =>
    set((state) => ({
      subscriptions: state.subscriptions.map((sub) =>
        sub._id === id ? { ...sub, ...updated } : sub
      ),
    })),

  removeSubscription: (id) =>
    set((state) => ({
      subscriptions: state.subscriptions.filter((sub) => sub._id !== id),
    })),

  setFilter: (filterUpdate) =>
    set((state) => ({
      filter: { ...state.filter, ...filterUpdate },
    })),

  resetFilters: () =>
    set({
      filter: { status: 'all', categoryId: 'all', search: '' },
    }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

export default useSubscriptionStore;
