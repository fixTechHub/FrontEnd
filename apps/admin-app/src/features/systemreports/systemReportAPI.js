import ApiBE from '../../services/ApiBE';

export const systemReportAPI = {
    // Get all system reports
    getAll: async () => {
        try {
            const response = await ApiBE.get('/system-reports');
            return response.data;
        } catch (error) {
            console.error('Get all system reports error:', error);
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
            console.log('Payload gửi lên:', payload);
            const response = await ApiBE.patch(`/system-reports/${id}/status`, payload);
            return response.data;
        } catch (error) {
            console.error('Update system report status error:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response errors:', error.response.data.errors);
            }
            throw error;
        }
    },
}; 