import apiClient from '../../services/ApiBE';

export const couponUsageAPI = {
    getAll: async () => {
      try {
        const response = await apiClient.get('/Dashboard/couponusages');
        return response.data;
      } catch (error) {
        console.error('Get all coupon usage error:', error);
        throw error;
      }
    },
  
    getById: async (id) => {
      try {
        const response = await apiClient.get(`/Dashboard/couponusages/id/${id}`);
        return response.data;
      } catch (error) {
        console.error('Get coupon usage by ID error:', error);
        throw error;
      }
    }
  };