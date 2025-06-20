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

export const createBooking = async (formData) => apiClient.post('/bookings/create-new-booking-request', formData);
export const cancelBooking = async (formData) => apiClient.post(`/bookings/${bookingId}/cancel`, formData);
export const confirmJobDone = async () => apiClient.post(`/bookings/${bookingId}/done`);

