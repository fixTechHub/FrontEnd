import apiClient from '../../services/apiClient';
export const getTechnicians = async (technicianId) => {
    const response = await apiClient.get(`/admin/technicians`);
    return response.data;
};

