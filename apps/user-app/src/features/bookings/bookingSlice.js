import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { cancelBookingById, createBooking, getBookingById, getQuatationsByBookingId,getUserBookingHistory } from './bookingAPI';

export const fetchBookingById = createAsyncThunk(
    'booking/fetchBookingById',
    async (bookingId) => {
        const res = await getBookingById(bookingId);
        // console.log('--- FETCH BOOKING ---', res);

        return res.data.data;
    }
);

export const fetchQuotationsByBookingId = createAsyncThunk(
    'booking/fetchQuotationsByBookingId',
    async (bookingId) => {
        const res = await getQuatationsByBookingId(bookingId);
        // console.log('--- FETCH QUOTATIONS ---', res);

        return res.data.data;
    }
);

export const createNewBooking = createAsyncThunk(
    'booking/createNewBooking',
    async (data) => {
        const res = await createBooking(data);
        // console.log('--- CREATE BOOKING ---', res);

        return res.data.data;
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
            return rejectWithValue(error.response?.data || 'Failed to fetch booking history');
        }
    }
);

const bookingSlice = createSlice({
    name: 'booking',
    initialState: {
        bookings: [],
        booking: null,
        quotations: [],
        status: 'idle',
        error: null,
    },
    reducers: {},
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
            .addCase(fetchQuotationsByBookingId.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchQuotationsByBookingId.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.quotations = action.payload;
            })
            .addCase(fetchQuotationsByBookingId.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(createNewBooking.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createNewBooking.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.bookings.push(action.payload)
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
                state.bookings = action.payload.data.bookings // Adjust based on API response structure
                state.total = action.payload.total || state.bookings.length; // Adjust if API provides total
            })
            .addCase(fetchUserBookingHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'An error occurred';
            });
    }
});

export default bookingSlice.reducer;
