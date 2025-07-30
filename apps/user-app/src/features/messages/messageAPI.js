import apiClient from '../../services/apiClient';

export const messageAPI = {
    getMessagesByBookingOrWarrantyId: (bookingId, bookingWarrantyId) => {
        const params = new URLSearchParams();
        if (bookingId) params.append('bookingId', bookingId);
        if (bookingWarrantyId) params.append('bookingWarrantyId', bookingWarrantyId);
        return apiClient.get(`/messages?${params.toString()}`);
    },
    sendMessage: (messageData) => {
        return apiClient.post('/messages', messageData);
    },
};