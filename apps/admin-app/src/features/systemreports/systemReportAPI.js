import ApiBE from '../../services/ApiBE';

export const systemReportAPI = {
    // Get all system reports
    getAll: async () => {
        try {
            const response = await ApiBE.get('/Dashboard/system-reports');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

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
            const response = await ApiBE.patch(`/Dashboard/system-reports/${id}/status`, payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
}; 