// src/features/booking/bookingSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingAPI } from './bookingAPI'

// Trạng thái ban đầu cho các thông tin liên quan đến việc tạo một booking mới
const initialState = {
    address: '', // Lưu địa chỉ dạng chuỗi đầy đủ do người dùng chọn
    location: null, // Lưu object GeoJSON { type: 'Point', coordinates: [lng, lat] }
    description: '', // Lưu mô tả sự cố
    status: 'idle', // Trạng thái chung của slice, ví dụ: 'idle', 'loading', 'succeeded', 'failed'
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
    name : 'booking',
    initialState,
    reducers: {
        setSelectedBookingLocation: (state, action) => {
            console.log('Reducer: Cập nhật vị trí mới vào store. Payload:', action.payload);
            state.address = action.payload.address;
            state.location = action.payload.location;
        },

        setBookingDescription: (state, action) => {
            state.description = action.payload;
        },

        clearBookingForm: (state) => {
            state.address = '';
            state.location = null;
            state.description = '';
        },
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
// Export các action creator để các component có thể import và sử dụng (dispatch)
export const {setSelectedBookingLocation, setBookingDescription, clearBookingForm, clearBookingError } = bookingSlice.actions;
// Export reducer để thêm vào store chính trong file store.js
export default bookingSlice.reducer;







