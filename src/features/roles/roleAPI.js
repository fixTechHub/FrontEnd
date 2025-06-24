import apiClient from '../../services/ApiBE';

export const roleAPI = {
    getAll: async () => {
        try {
            const response = await apiClient.get('/Dashboard/roles');
            return response.data;
        } catch (error) {
            console.error('Get all roles error:', error);
            throw error;
        }
    },
}; 