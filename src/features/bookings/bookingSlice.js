import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingAPI } from './bookingAPI';

const initialState = {
    booking: null,
    loading: false,
    error: null,
};

export const fetchBookingThunk = createAsyncThunk(
    'bookings/fetchBooking',
    async (bookingId, { rejectWithValue }) => {
        try {
            const response = await bookingAPI.getBookingById(bookingId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch booking');
        }
    }
);

const bookingSlice = createSlice({
    name: 'bookings',
    initialState,
    reducers: {
        clearBookingError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBookingThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBookingThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.booking = action.payload;
            })
            .addCase(fetchBookingThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearBookingError } = bookingSlice.actions;
export default bookingSlice.reducer;