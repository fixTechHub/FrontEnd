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

    subscriptionBalance: async (amount) => {
        try {
            // Note: The PATCH endpoint was already created, but we are using it
            // for the final step now. The name in the API reflects its new purpose.
            const response = await apiClient.post(`/payments/subscription`, {
                amount
            });
            return response;
        } catch (error) {
            console.error('Subscription balance error:', error);
            throw error;
        }
    },

    // ✅ Withdraw balance API
  withdrawBalance: async ({ technicianId, amount, paymentMethod }) => {
    try {
        console.log('Received params:', { technicianId, amount, paymentMethod });
      const response = await apiClient.post(`/technicians/${technicianId}/withdraw`, {
        technicianId,
        amount,
        paymentMethod
      });
      return response;
    } catch (error) {
      console.error('Withdraw balance error:', error);
      throw error;
    }
  },

     extendSubscription: async ({ technicianId, packageId, days }) => {
  try {
    console.log('Extend subscription params:', { technicianId, packageId, days });

    // ✅ Đường dẫn đúng theo router bạn đã khai báo
    const response = await apiClient.post(`/payments/subscription/extend`, {
      technicianId,
      packageId,
      days,
    });

    console.log('Extend subscription response:', response.data);
    return response.data; // Trả về checkoutUrl
  } catch (error) {
    console.error('Extend subscription error:', error?.response?.data || error.message);
    throw error;
  }
}

}