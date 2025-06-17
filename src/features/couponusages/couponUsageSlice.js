import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { couponUsageAPI } from './couponUsageAPI';

// Async thunks
export const fetchCouponUsages = createAsyncThunk(
  'couponUsage/fetchCouponUsages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await couponUsageAPI.getAll();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCouponUsageById = createAsyncThunk(
  'couponUsage/fetchCouponUsageById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await couponUsageAPI.getById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  usages: [],
  loading: false,
  error: null,
  success: false,
};

const couponUsageSlice = createSlice({
  name: 'couponUsage',
  initialState,
  reducers: {
    resetState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCouponUsages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCouponUsages.fulfilled, (state, action) => {
        state.loading = false;
        state.usages = action.payload;
      })
      .addCase(fetchCouponUsages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetState } = couponUsageSlice.actions;
export default couponUsageSlice.reducer;