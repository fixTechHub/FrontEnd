import ApiBE from '../../services/ApiBE';

export const systemReportAPI = {
    // Get all system reports
    getAll: async () => {
        try {
            const response = await ApiBE.get('/Dashboard/systemreports');
            return response.data;
        } catch (error) {
            // Don't log 404 errors as they're expected if endpoint doesn't exist
            if (error.response?.status !== 404) {
                console.error('Get system reports error:', error);
            }
            return []; // Return empty array instead of throwing
        }
    },

    //Sửa ở đây

    // Update system report status
    updateStatus: async (id, statusValue, resolutionNote, resolvedBy) => {
        try {
            if (typeof statusValue !== 'string') {
                throw new Error('statusValue must be a string');
            }

            const payload = { 
                status: statusValue.toUpperCase(),
                resolutionNote: resolutionNote || null,
                resolvedBy: resolvedBy || null
            };
            const response = await ApiBE.patch(`/Dashboard/systemreports/${id}/status`, payload);

            return response.data;
        } catch (error) {
            // Don't log 404 errors as they're expected if endpoint doesn't exist
            if (error.response?.status !== 404) {
                console.error('Update system report error:', error);
            }
            return null; // Return null instead of throwing
        }
    },
}; 