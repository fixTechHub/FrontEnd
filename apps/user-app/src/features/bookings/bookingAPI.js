import apiClient from '../../services/apiClient';

export const bookingAPI = {
    getBookingById: async (bookingId) => {
        try {
            const response = await apiClient.get(`/bookings/${bookingId}`);
            return response;
        } catch (error) {
            console.error('Get booking error:', error);
            throw error;
        }
    },
};

export const createBooking = (formData) => apiClient.post('/bookings/create-new-booking-request', formData);
export const cancelBookingById = (bookingId, reason) => apiClient.post(`/bookings/${bookingId}/cancel`, { reason });
export const confirmJobDone = (bookingId) => apiClient.post(`/bookings/${bookingId}/done`);
export const getBookingById = (bookingId) => apiClient.get(`/bookings/${bookingId}`);
export const getTopBookedServices = () => apiClient.get(`/bookings/top-services`);
export const selectTechnician = (bookingId, technicianId) => apiClient.post(`/bookings/${bookingId}/select-technician`, { technicianId });

export const confirmJobDoneByTechnician = (bookingId) => apiClient.post(`/technicians/${bookingId}/done`);
export const technicianConfirmBooking = (bookingId) => apiClient.post(`/bookings/${bookingId}/technician-confirm`);
