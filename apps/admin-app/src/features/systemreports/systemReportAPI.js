import ApiBE from '../../services/ApiBE';

export const systemReportAPI = {
    // Get all system reports
    getAll: async () => {
        try {
            const response = await ApiBE.get('/Dashboard/systemreports');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update system report status
    updateStatus: async (id, statusValue) => {
        try {
            if (typeof statusValue !== 'string') {
                throw new Error('statusValue must be a string');
            }
            const payload = { status: statusValue.toUpperCase() };
            const response = await ApiBE.patch(`/Dashboard/systemreports/${id}/status`, payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
}; 