import api from './api';

export const getAllItems = async () => {
  const response = await api.get('/items');
  return Array.isArray(response.data) ? response.data : (response.data.items || []);
};

export const createItem = async (itemData) => {
  const response = await api.post('/items/add', itemData);
  return response.data.item || response.data;
};

export const updateItem = async (id, itemData) => {
  const response = await api.put(`/items/${encodeURIComponent(id)}`, itemData);
  return response.data.item || response.data;
};

export const deleteItem = async (id) => {
  const response = await api.delete(`/items/${encodeURIComponent(id)}`);
  return response.data;
};
