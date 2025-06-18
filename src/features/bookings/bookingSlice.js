// src/features/booking/bookingSlice.js

import { createSlice } from '@reduxjs/toolkit';

// Trạng thái ban đầu cho các thông tin liên quan đến việc tạo một booking mới
const initialState = {
    address: '', // Lưu địa chỉ dạng chuỗi đầy đủ do người dùng chọn
    location: null, // Lưu object GeoJSON { type: 'Point', coordinates: [lng, lat] }
    description: '', // Lưu mô tả sự cố
    status: 'idle', // Trạng thái chung của slice, ví dụ: 'idle', 'loading', 'succeeded', 'failed'
};

// Sử dụng createSlice từ Redux Toolkit để tạo reducer và actions một cách ngắn gọn
const bookingSlice = createSlice({
    name: 'booking',
    initialState,
    // Reducers là nơi định nghĩa các hành động làm thay đổi state
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
        }
    },
});

// Export các action creator để các component có thể import và sử dụng (dispatch)
export const { setSelectedBookingLocation, setBookingDescription, clearBookingForm } = bookingSlice.actions;

// Export reducer để thêm vào store chính trong file store.js
export default bookingSlice.reducer;
