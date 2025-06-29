import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { requestWarranty } from './warrantyAPI'; // Assuming the requestWarranty function is in a service file

// Async thunk for requesting a warranty
export const requestWarrantyThunk = createAsyncThunk(
  'warranty/requestWarranty',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await requestWarranty(bookingId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const warrantySlice = createSlice({
  name: 'warranty',
  initialState: {
    warranty: null,
    loading: false,
    error: null,
  },
  reducers: {
    resetWarrantyState: (state) => {
      state.warranty = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(requestWarrantyThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestWarrantyThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.warranty = action.payload;
        state.error = null;
      })
      .addCase(requestWarrantyThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Đã xảy ra lỗi khi yêu cầu bảo hành';
      });
  },
});

export const { resetWarrantyState } = warrantySlice.actions;
export default warrantySlice.reducer;