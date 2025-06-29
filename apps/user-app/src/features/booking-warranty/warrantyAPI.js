import apiClient from '../../services/apiClient';

export const requestWarranty = (bookingId) => apiClient.post('/warranties', bookingId);