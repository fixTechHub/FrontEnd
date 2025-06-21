import apiClient from '../../services/apiClient';

export const messageAPI = {
    getMessagesByBookingId: (bookingId) => {
        return apiClient.get(`/messages?bookingId=${bookingId}`);
    },
    sendMessage: (messageData) => {
        return apiClient.post('/messages', messageData);
    },
};