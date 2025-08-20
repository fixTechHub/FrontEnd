import ApiBE from '../../services/ApiBE';

export const bookingStatusLogAPI = {
    // Get all booking status logs
    getAll: async () => {
        try {
            const response = await ApiBE.get('/BookingStatusLog');
            return response.data;
        } catch (error) {
            if (error.code !== 'ECONNABORTED' && error.message !== 'timeout of 15000ms exceeded') {
                console.error('Get all booking status logs error:', error);
            }
            throw error;
        }
    },

    // Get booking status log by ID
    getById: async (id) => {
        try {
            const response = await ApiBE.get(`/BookingStatusLog/${id}`);
            return response.data;
        } catch (error) {
            if (error.code !== 'ECONNABORTED' && error.message !== 'timeout of 15000ms exceeded') {
                console.error('Get booking status log by ID error:', error);
            }
            throw error;
        }
    },

    // Get booking status logs by booking ID
    getByBookingId: async (bookingId) => {
        try {
            const response = await ApiBE.get(`/BookingStatusLog/booking/${bookingId}`);
            return response.data;
        } catch (error) {
            if (error.code !== 'ECONNABORTED' && error.message !== 'timeout of 15000ms exceeded') {
                console.error('Get booking status logs by booking ID error:', error);
            }
            throw error;
        }
    },

    // Get booking status logs by user who changed the status
    getByChangedBy: async (changedBy) => {
        try {
            const response = await ApiBE.get(`/BookingStatusLog/changed-by/${changedBy}`);
            return response.data;
        } catch (error) {
            if (error.code !== 'ECONNABORTED' && error.message !== 'timeout of 15000ms exceeded') {
                console.error('Get booking status logs by changed by error:', error);
            }
            throw error;
        }
    },

    // Get booking status logs by role
    getByRole: async (role) => {
        try {
            const response = await ApiBE.get(`/BookingStatusLog/role/${role}`);
            return response.data;
        } catch (error) {
            if (error.code !== 'ECONNABORTED' && error.message !== 'timeout of 15000ms exceeded') {
                console.error('Get booking status logs by role error:', error);
            }
            throw error;
        }
    },

    // Get booking status logs by date range
    getByDateRange: async (fromDate, toDate) => {
        try {
            const response = await ApiBE.get('/BookingStatusLog/date-range', {
                params: {
                    fromDate: fromDate.toISOString(),
                    toDate: toDate.toISOString()
                }
            });
            return response.data;
        } catch (error) {
            if (error.code !== 'ECONNABORTED' && error.message !== 'timeout of 15000ms exceeded') {
                console.error('Get booking status logs by date range error:', error);
            }
            throw error;
        }
    },

    // Get filtered and paginated booking status logs
    getFiltered: async (filter) => {
        try {
            const response = await ApiBE.get('/BookingStatusLog/filtered', {
                params: filter
            });
            return response.data;
        } catch (error) {
            if (error.code !== 'ECONNABORTED' && error.message !== 'timeout of 15000ms exceeded') {
                console.error('Get filtered booking status logs error:', error);
            }
            throw error;
        }
    },

    // Get complete booking history
    getBookingHistory: async (bookingId) => {
        try {
            const response = await ApiBE.get(`/BookingStatusLog/history/${bookingId}`);
            return response.data;
        } catch (error) {
            if (error.code !== 'ECONNABORTED' && error.message !== 'timeout of 15000ms exceeded') {
                console.error('Get booking history error:', error);
            }
            throw error;
        }
    },
};
