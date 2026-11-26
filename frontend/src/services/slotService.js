import api from './api';

export const getStoreSlots = async (params = {}) => {
  const response = await api.get('/store-slots', { params });
  return response.data?.data || [];
};

export const createStoreSlot = async (payload) => {
  const response = await api.post('/store-slots', payload);
  return response.data?.data;
};

export const updateStoreSlot = async (slotId, payload) => {
  const response = await api.patch(`/store-slots/${slotId}`, payload);
  return response.data?.data;
};

export const cancelStoreSlot = async (slotId) => {
  const response = await api.patch(`/store-slots/${slotId}/cancel`);
  return response.data?.data;
};

export const getTrips = async (params = {}) => {
  const response = await api.get('/trips', { params });
  return response.data?.trips || [];
};

export const reportTripDelay = async (tripId, delayMinutes) => {
  const response = await api.patch(`/trips/${tripId}/delay`, { delayMinutes });
  return response.data;
};
