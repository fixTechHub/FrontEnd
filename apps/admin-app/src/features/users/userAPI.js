import ApiBE from '../../services/ApiBE';

export const userAPI = {
    // Get all users
    getAll: async () => {
        try {
            const response = await ApiBE.get('/Dashboard/users');
            return response.data;
        } catch (error) {
            console.error('Get all users error:', error);
            throw error;
        }
    },

    // Get user by ID
    getById: async (id) => {
        try {
            const response = await ApiBE.get(`/Dashboard/users/${id}`);
            return response.data;
        } catch (error) {
            console.error('Get user by ID error:', error);
            throw error;
        }
    },

    update: async (id, userData) => {
        const response = await ApiBE.put(`/Dashboard/users/${id}`, userData);
        return response.data;
    },

    // Lock user
    lockUser: async (id, reason) => {
        try {
            const response = await ApiBE.post(`/Dashboard/users/${id}/lock`, { reason });
            return response.data;
        } catch (error) {
            console.error('Lock user error:', error);
            throw error;
        }
    },

    // Unlock user
    unlockUser: async (id, note = '') => {
        try {
            const response = await ApiBE.post(`/Dashboard/users/${id}/unlock`, { note });
            return response.data;
        } catch (error) {
            console.error('Unlock user error:', error);
            throw error;
        }
    },
}; 