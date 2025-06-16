import apiClient from '../../services/apiClient';



export const messageAPI = {
    getMessagesByBookingId: async (bookingId) => {
        try {
            const response = await apiClient.get(`/messages/?bookingId=${bookingId}`);
            return response;
        } catch (error) {
            console.error('Get messages error:', error);
            throw error;
        }
    },
};