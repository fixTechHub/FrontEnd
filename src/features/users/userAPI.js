import apiClient from '../../services/ApiBE';

export const userAPI = {
    // Get all users
    getAll: async () => {
        try {
            const response = await apiClient.get('/Dashboard/users');
            return response.data;
        } catch (error) {
            console.error('Get all users error:', error);
            throw error;
        }
    },

    // Get user by ID
    getById: async (id) => {
        try {
            const response = await apiClient.get(`/Dashboard/users/${id}`);
            return response.data;
        } catch (error) {
            console.error('Get user by ID error:', error);
            throw error;
        }
    },

    update: async (id, userData) => {
        const response = await apiClient.put(`/Dashboard/users/${id}`, userData);
        return response.data;
    },
}; 