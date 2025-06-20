import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { couponAPI } from './couponAPI';

// Async thunks
export const fetchCoupons = createAsyncThunk(
  'coupon/fetchCoupons',
  async (_, { rejectWithValue }) => {
    try {
      const response = await couponAPI.getAll();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createCoupon = createAsyncThunk(
  'coupon/createCoupon',
  async (couponData, { dispatch, rejectWithValue }) => {
    try {
      const response = await couponAPI.create(couponData);
      dispatch(fetchCoupons());
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCoupon = createAsyncThunk(
  'coupon/updateCoupon',
  async ({ id, couponData }, { dispatch, rejectWithValue }) => {
    try {
      console.log('Updating coupon in slice:', { id, couponData });
      const response = await couponAPI.update(id, couponData);
      dispatch(fetchCoupons());
      return response;
    } catch (error) {
      console.error('Update coupon error:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteCoupon = createAsyncThunk(
  'coupon/deleteCoupon',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await couponAPI.delete(id);
      dispatch(fetchCoupons());
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchDeletedCoupons = createAsyncThunk(
  'coupon/fetchDeletedCoupons',
  async (_, { rejectWithValue }) => {
    try {
      const response = await couponAPI.getDeleted();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const restoreCoupon = createAsyncThunk(
  'coupon/restoreCoupon',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await couponAPI.restore(id);
      dispatch(fetchDeletedCoupons());
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  coupons: [],
  activeCoupons: [],
  expiredCoupons: [],
  loading: false,
  error: null,
  success: false,
  currentCoupon: null,
  usageStats: null,
  deletedCoupons: [],
};

const couponSlice = createSlice({
  name: 'coupon',
  initialState,
  reducers: {
    resetState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.currentCoupon = null;
      state.usageStats = null;
    },
    setCurrentCoupon: (state, action) => {
      state.currentCoupon = action.payload;
    },
    clearCurrentCoupon: (state) => {
      state.currentCoupon = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Coupons
      .addCase(fetchCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload;
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Coupon
      .addCase(createCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCoupon.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Coupon
      .addCase(updateCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCoupon.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(updateCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Coupon
      .addCase(deleteCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCoupon.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(deleteCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Deleted Coupons
      .addCase(fetchDeletedCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeletedCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.deletedCoupons = action.payload;
      })
      .addCase(fetchDeletedCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Restore Coupon
      .addCase(restoreCoupon.fulfilled, (state) => {
        state.success = true;
      })
      .addCase(restoreCoupon.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Validate Coupon
  
      // Get Usage Stats
      
  },
});

export const { resetState, setCurrentCoupon, clearCurrentCoupon } = couponSlice.actions;
export default couponSlice.reducer; 