import apiClient from '../../services/apiClient';

export const getPublicCategories = async () => apiClient.get('/categories/public');
export const getTopCategoriesByBookings = async () => apiClient.get('/categories/top');