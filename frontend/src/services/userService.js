import api from './api';

/**
 * Authenticates a user and returns their token and role.
 */
export const loginUser = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

/**
 * Fetches all registered users from the system.
 */
export const getAllUsers = async () => {
    const response = await api.get('/users');
    return response.data;
};

/**
 * Creates a new user in the system.
 */
export const createUser = async (userData) => {
    const response = await api.post('/users/add', userData);
    return response.data;
};

/**
 * Updates an existing user's details.
 */
export const updateUser = async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
};

/**
 * Deactivates/deletes a user account.
 */
export const deactivateUser = async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
};
