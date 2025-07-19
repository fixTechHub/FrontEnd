import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { transactionAPI } from './transactionAPI';
import { toast } from 'react-toastify';

// Initial state
const initialState = {
  loading: false,
  error: null,
  depositURL: null,
  successMessage: null,
};


export const finalizeBookingThunk = createAsyncThunk(
  'transaction/finalizeBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.finalizeBooking(bookingData);
      return response.data; // This will contain the paymentUrl if applicable
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Finalizing booking failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const depositBalance = createAsyncThunk(
  'transaction/depositBalance',
  async (amount, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.depositBalance(amount);
      return response.data.data.depositURL;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to deposit balance');
    }
  }
);

// Slice
const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTransactionState: (state) => {
      state.depositURL = null;
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // Finalize Booking
      .addCase(finalizeBookingThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(finalizeBookingThunk.fulfilled, (state, action) => {
        state.loading = false;
        // The backend response now contains the final state.
        // We can update the local state if needed, but for now, the primary
        // goal is to get the payment URL or confirm cash payment.
      })
      .addCase(finalizeBookingThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(depositBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(depositBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.depositURL = action.payload;
        state.successMessage = 'Nạp tiền thành công. Đang chuyển hướng đến cổng thanh toán.';
      })
      .addCase(depositBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearTransactionState } = transactionSlice.actions;
export default transactionSlice.reducer;
