import apiClient from '../../services/apiClient';

export const createBooking = async (formData) => apiClient.post('/bookings/create-new-booking-request', formData);
export const cancelBookingById = async (bookingId, reason) => apiClient.post(`/bookings/${bookingId}/cancel`, { reason });
export const confirmJobDone = async (bookingId) => apiClient.post(`/bookings/${bookingId}/done`);
export const getBookingById = async (bookingId) => apiClient.get(`/bookings/${bookingId}`);

export const getQuatationsByBookingId = async (bookingId) => apiClient.get(`/booking-prices/booking/${bookingId}`);
export const acceptQuotation = async (quotationId) => apiClient.post(`/booking-prices/${quotationId}/accept`);