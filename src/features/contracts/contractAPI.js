import apiClient from '../../services/apiClient';


export const contractAPI = {
    createEnvelope: async (data) => {
      try {
        const response = await apiClient.post('/contracts/create-envelope', data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response;
      } catch (error) {
        console.error('Create envelope error:', error);
        throw new Error(error.response?.data?.message || 'Failed to create envelope');
      }
    }
  };