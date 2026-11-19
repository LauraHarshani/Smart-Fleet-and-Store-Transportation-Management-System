import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetches all stores from the system.
 */
export const getAllStores = async () => {
  const response = await api.get('/stores');
  return response.data;
};

/**
 * Creates a new store in the system.
 */
export const createStore = async (storeData) => {
  const response = await api.post('/stores/add', storeData);
  return response.data?.store || response.data;
};

/**
 * Updates an existing store's details.
 */
export const updateStore = async (storeId, storeData) => {
  const response = await api.put(`/stores/${encodeURIComponent(storeId)}`, storeData);
  return response.data?.store || response.data;
};

/**
 * Deletes a store from the system.
 */
export const deleteStore = async (storeId) => {
  const response = await api.delete(`/stores/${encodeURIComponent(storeId)}`);
  return response.data;
};