import ApiBE from '../../services/ApiBE';

export const technicianAPI = {
    // Get all technicians
    getAll: async () => {
        try {
            const response = await ApiBE.get('/Dashboard/technicians');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get technician by ID
    getById: async (id) => {
        try {
            const response = await ApiBE.get(`/Dashboard/technicians/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update technician status
    updateStatus: async (id, status, note) => {
        try {
            const response = await ApiBE.patch(`/Dashboard/technicians/${id}/status`, {
                status,
                note
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get technician count by month
    getTechnicianCountByMonth: async (year, month) => {
        try {
            const response = await ApiBE.get(`/Dashboard/technician-count?year=${year}&month=${month}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};