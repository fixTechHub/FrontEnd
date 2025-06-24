import apiClient from '../../services/ApiBE';

export const systemReportAPI = {
    // Get all system reports
    getAll: async () => {
        try {
            const response = await apiClient.get('/Dashboard/systemreports');
            return response.data;
        } catch (error) {
            console.error('Get all system reports error:', error);
            throw error;
        }
    },

    // Update system report status
    updateStatus: async (id, status) => {
        try {
            const response = await apiClient.patch(`/Dashboard/systemreports/${id}/status`, status);
            return response.data;
        } catch (error) {
            console.error('Update system report status error:', error);
            throw error;
        }
    },
}; 