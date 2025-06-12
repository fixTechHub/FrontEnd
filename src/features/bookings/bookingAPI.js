import apiClient from '../../services/apiClient';


export const bookingAPI = {
    getBookingById: async (bookingId) => {
        try {
            const response = await apiClient.get(`/${bookingId}`);
            return response;
        } catch (error) {
            console.error('Get booking error:', error);
            throw error;
        }
    },
};