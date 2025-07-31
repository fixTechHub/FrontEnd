import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { cancelBookingById, createBooking, getBookingById, getQuatationsByBookingId,getUserBookingHistory,getAcceptedBooking,getTopBookedServices, selectTechnician, technicianConfirmBooking } from './bookingAPI';

export const fetchBookingById = createAsyncThunk(
    'booking/fetchBookingById',
    async (bookingId) => {
        const res = await getBookingById(bookingId);
        // console.log('--- FETCH BOOKING ---', res.data.data);

        return res.data.data;
    }
);

export const createNewBooking = createAsyncThunk(
    'booking/createNewBooking',
    async (data) => {
        const res = await createBooking(data);
        console.log('--- CREATE BOOKING ---', res);

        return res.data;
    }
);

export const cancelBooking = createAsyncThunk(
    'booking/cancelBooking',
    async ({ bookingId, reason }, { rejectWithValue }) => {
        try {
            const res = await cancelBookingById(bookingId, reason);
            // console.log('--- CANCEL BOOKING ---', res);
            return res.data;
        } catch (error) {
            // console.error('--- CANCEL BOOKING ERROR ---', error);
            const message =
                error?.response?.data?.message || error.message || 'Đã xảy ra lỗi';
            return rejectWithValue(message);
        }
    }
);

export const fetchUserBookingHistory = createAsyncThunk(
    'bookingHistory/fetchUserBookingHistory',
    async ({ limit, skip }, { rejectWithValue }) => {
        try {
            const response = await getUserBookingHistory({ limit, skip })
            
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch booking history');}})
export const fetchTopBookedServices = createAsyncThunk(
    'booking/fetchTopBookedServices',
    async () => {
        const res = await getTopBookedServices();
        // console.log('--- FETCH TOP SERVICE BOOKING ---', res.data);

        return res.data.data;
    }
);

export const selectTechnicianThunk = createAsyncThunk(
    'booking/selectTechnician',
    async ({ bookingId, technicianId }, { rejectWithValue }) => {
        try {
            const res = await selectTechnician(bookingId, technicianId);
            return res.data;
        } catch (error) {
            const message = error?.response?.data?.error || error.message || 'Đã xảy ra lỗi';
            return rejectWithValue(message);
        }
    }
);

export const getAcceptedBookingThunk = createAsyncThunk(
    'booking/getAcceptedBooking',
    async (bookingId, { rejectWithValue }) => {
        try {
            const response = await getAcceptedBooking(bookingId);
            
            if (!response.data.success) {
                return rejectWithValue(response.data.message);
            }
            
            return response.data.data;
        } catch (error) {
            console.error('Get Accepted Booking Error:', error);
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch accepted booking');}})
export const technicianConfirmBookingThunk = createAsyncThunk(
    'booking/technicianConfirmBooking',
    async (bookingId, { rejectWithValue }) => {
        try {
            const res = await technicianConfirmBooking(bookingId);
            return res.data;
        } catch (error) {
            const message = error?.response?.data?.error || error.message || 'Đã xảy ra lỗi';
            return rejectWithValue(message);
        }
    }
);

const initialState = {
    bookings: [],
    newBooking: null,
    techniciansFound: [],
    bookingHistories: [],
    acceptedBooking: null,
    detailsBooking: null,
    topBookedServices: [],
    userCoupons: [],
    booking: null,
    quotations: [],
    loading: false,
    error: null,
    status: 'idle',
};

const bookingSlice = createSlice({
    name: 'booking',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearAcceptedBooking: (state) => {
            state.acceptedBooking = null;
            state.userCoupons = [];
        },
        setLastCancelBy: (state, action) => {
            state.lastCancelBy = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBookingById.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchBookingById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.booking = action.payload;
            })
            .addCase(fetchBookingById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })

            .addCase(createNewBooking.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createNewBooking.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.newBooking = action.payload.booking;
                state.techniciansFound = action.payload.technicians_found || [];
            })
            .addCase(createNewBooking.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })

            .addCase(cancelBooking.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(cancelBooking.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.booking = action.payload;
            })
            .addCase(cancelBooking.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(fetchUserBookingHistory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserBookingHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.bookingHistories = action.payload.data.bookings // Adjust based on API response structure
                state.total = action.payload.total || state.bookings.length; // Adjust if API provides total
            })
            .addCase(fetchUserBookingHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'An error occurred';
            })
            .addCase(getAcceptedBookingThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAcceptedBookingThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.acceptedBooking = action.payload.acceptedBooking;
                state.userCoupons = action.payload.userCoupons;
            })
            .addCase(getAcceptedBookingThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'An error occurred';
            })
            .addCase(fetchTopBookedServices.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTopBookedServices.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.topBookedServices = action.payload;
            })
            .addCase(fetchTopBookedServices.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })

            .addCase(selectTechnicianThunk.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(selectTechnicianThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Có thể cập nhật trạng thái booking nếu muốn
            })
            .addCase(selectTechnicianThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(technicianConfirmBookingThunk.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(technicianConfirmBookingThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Có thể cập nhật trạng thái booking nếu muốn
            })
            .addCase(technicianConfirmBookingThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
    }
});

export const { setLastCancelBy } = bookingSlice.actions;
export default bookingSlice.reducer;
