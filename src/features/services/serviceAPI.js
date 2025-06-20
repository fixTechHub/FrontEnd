import apiClient from '../../services/apiClient';

export const getPublicServices = async () => apiClient.get('/services/public');
export const getPublicServicesByCategoryId = async (id) => apiClient.get(`/services/${id}/public`);