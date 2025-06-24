import apiClient from '../../services/ApiBE';

export const technicianAPI = {
    // Get all technicians
    getAll: async () => {
        try {
            const response = await apiClient.get('/Dashboard/technicians');
            return response.data;
        } catch (error) {
            console.error('Get all technicians error:', error);
            throw error;
        }
    },

    // Get technician by ID
    getById: async (id) => {
        try {
            const response = await apiClient.get(`/Dashboard/technicians/${id}`);
            return response.data;
        } catch (error) {
            console.error('Get technician by ID error:', error);
            throw error;
        }
    },

    // Update technician status
    updateStatus: async (id, status, note) => {
        try {
            const response = await apiClient.patch(`/Dashboard/technicians/${id}/status`, {
                status,
                note
            });
            return response.data;
        } catch (error) {
            console.error('Update technician status error:', error);
            throw error;
        }
    },
};