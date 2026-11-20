import axios from 'axios';

const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const normalizedBase = rawBase.replace(/\/+$/, '');
const API_BASE = normalizedBase.endsWith('/api') ? normalizedBase : `${normalizedBase}/api`;
const VEHICLES_URL = `${API_BASE}/vehicles`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAllVehicles = async () => {
  const response = await axios.get(VEHICLES_URL, { headers: getAuthHeaders() });
  return Array.isArray(response.data) ? response.data : (response.data.vehicles || []);
};

export const createVehicle = async (vehicleData) => {
  const response = await axios.post(`${VEHICLES_URL}/add`, vehicleData, { headers: getAuthHeaders() });
  return response.data.vehicle || response.data;
};

export const updateVehicle = async (id, vehicleData) => {
  const response = await axios.put(`${VEHICLES_URL}/${encodeURIComponent(id)}`, vehicleData, { headers: getAuthHeaders() });
  return response.data.vehicle || response.data;
};

export const deleteVehicle = async (id) => {
  const response = await axios.delete(`${VEHICLES_URL}/${encodeURIComponent(id)}`, { headers: getAuthHeaders() });
  return response.data;
};

export const getAvailableDrivers = async () => {
  try {
    const response = await axios.get(`${API_BASE}/users`, { headers: getAuthHeaders() });
    const list = Array.isArray(response.data) ? response.data : (response.data.users || []);
    return list.filter((u) => String(u.role || '').toLowerCase() === 'driver');
  } catch (_) {
    return [];
  }
};