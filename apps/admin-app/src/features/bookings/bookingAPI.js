import ApiBE from '../../services/ApiBE';

export const bookingAPI = {
    // Get all bookings
    getAll: async () => {
        try {
            const response = await ApiBE.get('/Dashboard/bookings');
            return response.data;
        } catch (error) {
            console.error('Get all bookings error:', error);
            throw error;
        }
    },

    // Get booking by ID
    getById: async (id) => {
        try {
            const response = await ApiBE.get(`/Dashboard/bookings/${id}`);
            return response.data;
        } catch (error) {
            console.error('Get booking by ID error:', error);
            throw error;
        }
    },

    // Get booking count by month
    getBookingCountByMonth: async (year, month) => {
        try {
            const response = await ApiBE.get(`/Dashboard/booking-count?year=${year}&month=${month}`);
            return response.data;
        } catch (error) {
            console.error('Get booking count by month error:', error);
            throw error;
        }
    },
};