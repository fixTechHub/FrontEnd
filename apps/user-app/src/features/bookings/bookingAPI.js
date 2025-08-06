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

export const createBooking = (formData) => apiClient.post('/bookings/create-new-booking-request', formData);
export const cancelBookingById = (bookingId, reason) => apiClient.post(`/bookings/${bookingId}/cancel`, { reason });
export const confirmJobDone = (bookingId) => apiClient.post(`/bookings/${bookingId}/done`);
export const getBookingById = (bookingId) => apiClient.get(`/bookings/${bookingId}`);
export const getTopBookedServices = () => apiClient.get(`/bookings/top-services`);
export const selectTechnician = (bookingId, technicianId) => apiClient.post(`/bookings/${bookingId}/select-technician`, { technicianId });

export const getQuatationsByBookingId = (bookingId) => apiClient.get(`/booking-prices/booking/${bookingId}`);
export const acceptQuotation = (quotationId) => apiClient.post(`/booking-prices/${quotationId}/accept`);

export const getUserBookingHistory = ({ limit, skip }) => apiClient.get(`/bookings/user?limit=${limit}&skip=${skip}`);

export const getAcceptedBooking = (bookingId) => apiClient.get(`/bookings/accepted-booking/${bookingId}`);
export const confirmJobDoneByTechnician = (bookingId) => apiClient.post(`/technicians/${bookingId}/done`);
export const technicianConfirmBooking = (bookingId) => apiClient.post(`/bookings/${bookingId}/technician-accept`);
export const technicianRejectBooking = (bookingId) => apiClient.post(`/bookings/${bookingId}/technician-reject`);

export const technicianSendQuote = (bookingId, quoteData) => apiClient.post(`/bookings/${bookingId}/quote`, quoteData);
export const customerAcceptQuote = (bookingId) => apiClient.post(`/bookings/${bookingId}/quote/accept`);
export const customerRejectQuote = (bookingId) => apiClient.post(`/bookings/${bookingId}/quote/reject`);

export const fetchBookingRequests = (bookingId) => apiClient.get(`/bookings/${bookingId}/technician-requests`);
export const fetchTechniciansFoundByBookingId = (bookingId) => apiClient.get(`/bookings/${bookingId}/technicians-found`);
