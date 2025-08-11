import apiClient from '../../services/apiClient';

export const getTechnicians = async (technicianId) => {
    const response = await apiClient.get(`/admin/technicians`);
    return response.data;
};


export const  approveTechnician=  async (technicianId) => {
        try {
            console.log(technicianId);
            
            const response = await apiClient.put(`/admin/technicians/${technicianId}/approve`);
            return response.data;
        } catch (error) {
            console.error('Error approving technician:', error.response?.data || error.message);
            throw error.response?.data || error;
        }
    }

