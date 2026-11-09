// import axios from 'axios';
// const API_URL = 'http://localhost:5000/api'; // Replace with your actual backend URL

/**
 * Authenticates a user and returns their token and role.
 * @param {Object} credentials - The user's login details { email, password }
 * @returns {Object} User session data { token, role, name }
 */
export const loginUser = async (credentials) => {
    console.log('Attempting to login with:', credentials.email);
    
    // TODO: Replace with real API call
    // const response = await axios.post(`${API_URL}/auth/login`, credentials);
    // return response.data;

    // Simulating API delay and returning dummy data
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ 
                token: 'sample-jwt-token-12345', 
                role: 'ADMIN', // Try changing this to 'STORE MANAGER' or 'DRIVER' to test routing
                name: 'Nuwan Perera' 
            });
        }, 1000);
    });
};

/**
 * Fetches all registered users from the system.
 * @returns {Array} List of user objects
 */
export const getAllUsers = async () => {
    // TODO: Replace with real API call
    // const response = await axios.get(`${API_URL}/users`);
    // return response.data;

    // Returning dummy data based on your Figma design
    return [
        { id: 'USR-1001', name: 'Nuwan Perera', email: 'nuwan.p@logifleet.lk', role: 'ADMIN', store: 'Colombo Main Store', status: 'Active' },
        { id: 'USR-1042', name: 'Damith Bandara', email: 'damith.b@logifleet.lk', role: 'STORE MANAGER', store: 'Colombo Main Store', status: 'Active' },
        { id: 'USR-1085', name: 'Kasun Wickramasinghe', email: 'kasun.w@logifleet.lk', role: 'DRIVER', store: 'Colombo Main Store', status: 'Active' },
        { id: 'USR-2014', name: 'Chathuri Senanayake', email: 'chathuri.s@logifleet.lk', role: 'STORE MANAGER', store: 'Kandy Branch', status: 'Active' },
        { id: 'USR-2055', name: 'Roshan Alwis', email: 'roshan.a@logifleet.lk', role: 'STORE EMPLOYEE', store: 'Kandy Branch', status: 'Active' },
        { id: 'USR-3019', name: 'Suresh Jayawardena', email: 'suresh.j@logifleet.lk', role: 'DRIVER', store: 'Galle Warehouse', status: 'Active' },
        { id: 'USR-3072', name: 'Minoli Fernando', email: 'minoli.f@logifleet.lk', role: 'STORE EMPLOYEE', store: 'Galle Warehouse', status: 'On Leave' },
        { id: 'USR-4011', name: 'Dinesh Mendis', email: 'dinesh.m@logifleet.lk', role: 'DRIVER', store: 'Kandy Branch', status: 'Inactive' },
    ];
};

/**
 * Creates a new user in the system.
 * @param {Object} userData - The new user's details (name, email, role, etc.)
 * @returns {Object} Success response
 */
export const createUser = async (userData) => {
    // TODO: Replace with real API call
    // const response = await axios.post(`${API_URL}/users`, userData);
    // return response.data;

    console.log('New User Created successfully:', userData);
    return { success: true, message: 'User created successfully' };
};

/**
 * Updates an existing user's details.
 * @param {String} userId - The unique ID of the user (e.g., 'USR-1042')
 * @param {Object} userData - The updated details
 * @returns {Object} Success response
 */
export const updateUser = async (userId, userData) => {
    // TODO: Replace with real API call
    // const response = await axios.put(`${API_URL}/users/${userId}`, userData);
    // return response.data;

    console.log(`User ${userId} updated successfully with data:`, userData);
    return { success: true, message: 'User updated successfully' };
};

/**
 * Deactivates a user account instead of permanently deleting it.
 * @param {String} userId - The unique ID of the user to deactivate
 * @returns {Object} Success response
 */
export const deactivateUser = async (userId) => {
    // TODO: Replace with real API call
    // const response = await axios.patch(`${API_URL}/users/${userId}/deactivate`);
    // return response.data;

    console.log(`User ${userId} has been deactivated.`);
    return { success: true, message: 'User deactivated successfully' };
};