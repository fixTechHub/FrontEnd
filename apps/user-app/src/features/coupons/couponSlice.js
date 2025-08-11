import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUserCoupons } from './couponAPI';

export const fetchUserCouponsThunk = createAsyncThunk('coupons/fetchUserCoupons', async (_, { rejectWithValue }) => {
  try {
    const res = await getUserCoupons();
    return res.data.coupons || [];
  } catch (error) {
    const msg = error.response?.data?.message || error.message || 'Đã xảy ra lỗi';
    return rejectWithValue(msg);
  }
});

const couponSlice = createSlice({
  name: 'coupons',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserCouponsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserCouponsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchUserCouponsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default couponSlice.reducer; 