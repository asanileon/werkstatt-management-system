import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // Auth State
      user: null,
      token: null,
      isAuthenticated: false,

      // Fahrzeuge State
      vehicles: [],
      loading: false,
      error: null,

      // Auth Actions
      login: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          vehicles: [],
        });
      },

      // Fahrzeuge Actions
      setVehicles: (vehicles) => {
        set({ vehicles });
      },

      addVehicle: (vehicle) => {
        set((state) => ({
          vehicles: [vehicle, ...state.vehicles],
        }));
      },

      updateVehicle: (updatedVehicle) => {
        set((state) => ({
          vehicles: state.vehicles.map((v) =>
            v._id === updatedVehicle._id ? updatedVehicle : v
          ),
        }));
      },

      removeVehicle: (vehicleId) => {
        set((state) => ({
          vehicles: state.vehicles.filter((v) => v._id !== vehicleId),
        }));
      },

      setLoading: (loading) => {
        set({ loading });
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'werkstatt-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useStore;