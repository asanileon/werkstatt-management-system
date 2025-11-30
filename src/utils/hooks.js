import { useState, useCallback } from 'react';
import useStore from '../store/useStore';

// hook für api aufrufe mit fehlerbehandlung
export function useAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = useStore((state) => state.token);
  const logout = useStore((state) => state.logout);

  // api anfrage funktion
  const apiCall = useCallback(
    async (url, method = 'GET', body = null) => {
      setLoading(true);
      setError(null);

      try {
        const options = {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
        };

        // token mitschicken falls vorhanden
        if (token) {
          options.headers.Authorization = `Bearer ${token}`;
        }

        // daten mitschicken
        if (body) {
          options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        const data = await response.json();

        // wenn fehler dann ausloggen
        if (!response.ok) {
          // nicht autorisiert = raus
          if (response.status === 401) {
            logout();
          }
          throw new Error(data.error || 'Ein Fehler ist aufgetreten');
        }

        setLoading(false);
        return data;
      } catch (err) {
        setLoading(false);
        setError(err.message);
        throw err;
      }
    },
    [token, logout]
  );

  return { apiCall, loading, error, setError };
}

// hooks für verschiedene sachen

// fahrzeuge hook
export function useVehicles() {
  const { apiCall, loading, error } = useAPI();
  const { setVehicles, addVehicle, updateVehicle, removeVehicle } = useStore();

  const fetchVehicles = useCallback(async () => {
    try {
      const data = await apiCall('/api/vehicles');
      setVehicles(data.vehicles);
      return data.vehicles;
    } catch (err) {
      console.error('laden fehlgeschlagen:', err);
    }
  }, [apiCall, setVehicles]);

  const createVehicle = useCallback(
    async (vehicleData) => {
      const data = await apiCall('/api/vehicles', 'POST', vehicleData);
      addVehicle(data.vehicle);
      return data.vehicle;
    },
    [apiCall, addVehicle]
  );

  const updateVehicleData = useCallback(
    async (id, vehicleData) => {
      const data = await apiCall('/api/vehicles', 'PUT', { id, ...vehicleData });
      updateVehicle(data.vehicle);
      return data.vehicle;
    },
    [apiCall, updateVehicle]
  );

  const deleteVehicle = useCallback(
    async (id) => {
      await apiCall('/api/vehicles', 'DELETE', { id });
      removeVehicle(id);
    },
    [apiCall, removeVehicle]
  );

  const addService = useCallback(
    async (vehicleId, serviceData) => {
      const data = await apiCall(
        `/api/vehicles/${vehicleId}/service`,
        'POST',
        serviceData
      );
      updateVehicle(data.vehicle);
      return data.vehicle;
    },
    [apiCall, updateVehicle]
  );

  return {
    fetchVehicles,
    createVehicle,
    updateVehicleData,
    deleteVehicle,
    addService,
    loading,
    error,
  };
}

// hook für authentifizierung
export function useAuth() {
  const { apiCall, loading, error } = useAPI();
  const login = useStore((state) => state.login);

  const register = useCallback(
    async (userData) => {
      const data = await apiCall('/api/auth/register', 'POST', userData);
      login(data.user, data.token);
      return data;
    },
    [apiCall, login]
  );

  const loginUser = useCallback(
    async (credentials) => {
      const data = await apiCall('/api/auth/login', 'POST', credentials);
      login(data.user, data.token);
      return data;
    },
    [apiCall, login]
  );

  return { register, loginUser, loading, error };
}
