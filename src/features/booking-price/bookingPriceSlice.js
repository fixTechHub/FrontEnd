import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingAPI } from './bookingPriceAPI';
import { toast } from 'react-toastify';

// Initial state
const initialState = {
  bookingPrice: null,
  bookingItem: [],
  userCoupons: [],
  loading: false,
  error: null,
};

// Async thunks
export const getAcceptedBookingPriceThunk = createAsyncThunk(
  'bookingPrice/getAcceptedBookingPrice',
  async ({ bookingId, technicianId }, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.getAcceptedBookingPrice(bookingId, technicianId);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Không thể lấy thông tin accepted booking price';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Slice
const bookingPriceSlice = createSlice({
  name: 'bookingPrice',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearQuotation: (state) => {
      state.bookingPrice = null;
      state.bookingItem = [];
      state.userCoupons = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Accepted Booking Price
      .addCase(getAcceptedBookingPriceThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAcceptedBookingPriceThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingPrice = action.payload.bookingPrice;
        state.bookingItem = action.payload.bookingItem;
        state.userCoupons = action.payload.userCoupons;
        state.error = null;
      })
      .addCase(getAcceptedBookingPriceThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearQuotation } = bookingPriceSlice.actions;
export default bookingPriceSlice.reducer;
