import apiClient from '../../services/apiClient';

export const createBooking = (message) => apiClient.post('/ai/chat', message);