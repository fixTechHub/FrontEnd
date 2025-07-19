import apiClient from '../../services/apiClient';


export const transactionAPI = {
        finalizeBooking: async (bookingData) => {
        const { bookingId, couponCode, discountValue, finalPrice, paymentMethod } = bookingData;
        try {
            // Note: The PATCH endpoint was already created, but we are using it
            // for the final step now. The name in the API reflects its new purpose.
            const response = await apiClient.post(`/payments/finalize-booking/${bookingId}`, {
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
    depositBalance: async (amount) => {
        try {
            // Note: The PATCH endpoint was already created, but we are using it
            // for the final step now. The name in the API reflects its new purpose.
            const response = await apiClient.post(`/payments/deposit`, {
                amount
            });
            return response;
        } catch (error) {
            console.error('Deposit balance error:', error);
            throw error;
        }
    },
}