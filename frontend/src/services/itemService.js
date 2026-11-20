import axios from 'axios';

const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const normalizedBase = rawBase.replace(/\/+$/, '');
const API_BASE = normalizedBase.endsWith('/api') ? normalizedBase : `${normalizedBase}/api`;
const ITEMS_URL = `${API_BASE}/items`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAllItems = async () => {
  const response = await axios.get(ITEMS_URL, { headers: getAuthHeaders() });
  return Array.isArray(response.data) ? response.data : (response.data.items || []);
};

export const createItem = async (itemData) => {
  const response = await axios.post(`${ITEMS_URL}/add`, itemData, { headers: getAuthHeaders() });
  return response.data.item || response.data;
};

export const updateItem = async (id, itemData) => {
  const response = await axios.put(`${ITEMS_URL}/${encodeURIComponent(id)}`, itemData, { headers: getAuthHeaders() });
  return response.data.item || response.data;
};

export const deleteItem = async (id) => {
  const response = await axios.delete(`${ITEMS_URL}/${encodeURIComponent(id)}`, { headers: getAuthHeaders() });
  return response.data;
};