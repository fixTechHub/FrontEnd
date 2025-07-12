import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { cancelBookingById, createBooking, getBookingById, getTopBookedServices, } from './bookingAPI';

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

export const fetchTopBookedServices = createAsyncThunk(
    'booking/fetchTopBookedServices',
    async () => {
        const res = await getTopBookedServices();
        // console.log('--- FETCH TOP SERVICE BOOKING ---', res.data);
        
        return res.data.data;
    }
);

const bookingSlice = createSlice({
    name: 'booking',
    initialState: {
        bookings: [],
        booking: null,
        detailsBooking: null,
        topBookedServices: [],
        status: 'idle',
        error: null,
    },
    reducers: {
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
    }
});

export const { setLastCancelBy } = bookingSlice.actions;
export default bookingSlice.reducer;
