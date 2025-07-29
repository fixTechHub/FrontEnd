import ApiBE from '../../services/ApiBE';

export const roleAPI = {
    getAll: async () => {
        try {
            const response = await ApiBE.get('/Dashboard/roles');
            return response.data;
        } catch (error) {
            console.error('Get all roles error:', error);
            throw error;
        }
    },
}; 