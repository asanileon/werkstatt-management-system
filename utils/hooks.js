import { useState, useCallback } from 'react';
import useStore from '../store/useStore';

export function useAPI() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const token = useStore((state) => state.token);
  const logout = useStore((state) => state.logout);

  const apiCall = useCallback(
    async (url, method = 'GET', body = null) => {
      setLoading(true);
      setErr(null);

      try {
        const opts = {
          method,
          headers: { 'Content-Type': 'application/json' },
        };

        if (token) opts.headers.Authorization = `Bearer ${token}`;
        if (body) opts.body = JSON.stringify(body);

        const res = await fetch(url, opts);
        const json = await res.json();

        if (!res.ok) {
          if (res.status === 401) logout();
          throw new Error(json.error || 'Ein Fehler ist aufgetreten');
        }

        setLoading(false);
        return json;
      } catch (e) {
        setLoading(false);
        setErr(e.message);
        throw e;
      }
    },
    [token, logout]
  );

  return { apiCall, loading, err, setErr };
}

export function useVehicles() {
  const { apiCall, loading, err } = useAPI();
  const { setVehicles, addVehicle, updateVehicle, removeVehicle } = useStore();

  const fetchVehicles = useCallback(async () => {
    try {
      const json = await apiCall('/api/vehicles');
      setVehicles(json.vehicles);
      return json.vehicles;
    } catch (e) {
      console.error('laden fehlgeschlagen:', e);
    }
  }, [apiCall, setVehicles]);

  const createVehicle = useCallback(
    async (data) => {
      const json = await apiCall('/api/vehicles', 'POST', data);
      addVehicle(json.vehicle);
      return json.vehicle;
    },
    [apiCall, addVehicle]
  );

  const updateVehicleData = useCallback(
    async (id, data) => {
      const json = await apiCall('/api/vehicles', 'PUT', { id, ...data });
      updateVehicle(json.vehicle);
      return json.vehicle;
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
    async (vehicleId, data) => {
      const json = await apiCall(`/api/vehicles/${vehicleId}/service`, 'POST', data);
      updateVehicle(json.vehicle);
      return json.vehicle;
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
    err,
  };
}

export function useAuth() {
  const { apiCall, loading, err } = useAPI();
  const login = useStore((state) => state.login);

  const register = useCallback(
    async (data) => {
      const json = await apiCall('/api/auth/register', 'POST', data);
      login(json.user, json.token);
      return json;
    },
    [apiCall, login]
  );

  const loginUser = useCallback(
    async (data) => {
      const json = await apiCall('/api/auth/login', 'POST', data);
      login(json.user, json.token);
      return json;
    },
    [apiCall, login]
  );

  return { register, loginUser, loading, err };
}
