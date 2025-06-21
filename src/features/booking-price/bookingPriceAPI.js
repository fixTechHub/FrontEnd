import apiClient from '../../services/apiClient';


export const bookingAPI = {
    getAcceptedBookingPrice: async (bookingId,technicianId) => {
        try {
            const response = await apiClient.get(`/booking-price/acceptedBookingPrice/${bookingId}/${technicianId}`);
            return response;
        } catch (error) {
            console.error('Get booking error:', error);
            throw error;
        }
    },
   
    
};