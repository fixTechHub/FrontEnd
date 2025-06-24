import apiClient from '../../services/apiClient';

export const adminAPI = {
    approveTechnician: async (technicianId) => {
        try {
            const response = await apiClient.put(`/admin/technicians/${technicianId}/approve`);
            return response.data;
        } catch (error) {
            console.error('Error approving technician:', error.response?.data || error.message);
            throw error.response?.data || error;
        }
    }
};
