import ApiBE from '../../services/ApiBE';

export const reportAPI = {
    // Get all reports
    getAll: async () => {
        try {
            const response = await ApiBE.get('/Dashboard/reports');
            return response.data;
        } catch (error) {
            console.error('Get all reports error:', error);
            throw error;
        }
    },

    // Get report by ID
    getById: async (id) => {
        try {
            const response = await ApiBE.get(`/Dashboard/reports/${id}`);
            return response.data;
        } catch (error) {
            console.error('Get report by ID error:', error);
            throw error;
        }
    },
};
