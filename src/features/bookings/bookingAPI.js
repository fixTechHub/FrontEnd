import apiClient from '../../services/apiClient';

export const createBooking = async (formData) => apiClient.post('/bookings/create-new-booking-request', formData);
export const cancelBooking = async (formData) => apiClient.post(`/bookings/${bookingId}/cancel`, formData);
export const confirmJobDone = async () => apiClient.post(`/bookings/${bookingId}/done`);