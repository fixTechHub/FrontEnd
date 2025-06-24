import apiClient from '../../services/apiClient';

export const getPublicCategories = async () => apiClient.get('/categories/public');