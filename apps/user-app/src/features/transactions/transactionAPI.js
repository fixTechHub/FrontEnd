import apiClient from '../../services/apiClient';


export const transactionAPI = {
    finalizeBooking: async (bookingData) => {
        const { bookingPriceId, couponCode, discountValue, finalPrice, paymentMethod } = bookingData;
        try {
            // Note: The PATCH endpoint was already created, but we are using it
            // for the final step now. The name in the API reflects its new purpose.
            const response = await apiClient.post(`/payments/finalize-booking/${bookingPriceId}`, {
                couponCode,
                discountValue,
                finalPrice,
                paymentMethod
            });
            return response;
        } catch (error) {
            console.error('Finalize booking error:', error);
            throw error;
        }
    },
}