import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { transactionAPI } from './transactionAPI'; // adjust the path based on your folder structure

// Thunk to initiate deposit balance
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

const transactionSlice = createSlice({
  name: 'transaction',
  initialState: {
    depositURL: null,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearTransactionState: (state) => {
      state.depositURL = null;
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
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
  },
});

export const { clearTransactionState } = transactionSlice.actions;

export default transactionSlice.reducer;
