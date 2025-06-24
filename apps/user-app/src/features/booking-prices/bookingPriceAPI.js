import apiClient from '../../services/apiClient';

export const getQuotationInformation = async (quotationId) => apiClient.get(`/booking-prices/${quotationId}`);


export const bookingPriceAPI = {
    getAcceptedBookingPrice: async (bookingId,technicianId) => {
        try {
            const response = await apiClient.get(`/booking-prices/acceptedBookingPrice/${bookingId}/${technicianId}`);
            return response;
        } catch (error) {
            console.error('Get booking error:', error);
            throw error;
        }
    }
};