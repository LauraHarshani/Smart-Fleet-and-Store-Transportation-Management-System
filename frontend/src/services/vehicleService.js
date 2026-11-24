import api from './api';

export const getAllVehicles = async () => {
  const response = await api.get('/vehicles');
  return Array.isArray(response.data) ? response.data : (response.data.vehicles || []);
};

export const createVehicle = async (vehicleData) => {
  const response = await api.post('/vehicles/add', vehicleData);
  return response.data.vehicle || response.data;
};

export const updateVehicle = async (id, vehicleData) => {
  const response = await api.put(`/vehicles/${encodeURIComponent(id)}`, vehicleData);
  return response.data.vehicle || response.data;
};

export const deleteVehicle = async (id) => {
  const response = await api.delete(`/vehicles/${encodeURIComponent(id)}`);
  return response.data;
};

export const getAvailableDrivers = async () => {
  const response = await api.get('/users');
  const users = Array.isArray(response.data) ? response.data : (response.data.users || []);
  return users.filter((user) => user.role === 'DRIVER' && user.status === 'Active');
};
