
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {getAllCommissionConfigs, addCommissionConfig} from '../commission/commissionAPI';

export const fetchCommissionConfigs = createAsyncThunk(
  'commission/fetchConfigs',
  async (_, thunkAPI) => {
    try {
      const data = await getAllCommissionConfigs(); // res = { success, data }
      return data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const createCommissionConfig = createAsyncThunk(
  'commission/createConfig',
  async (configData, thunkAPI) => {
    try {
      const data = await addCommissionConfig(configData);
      
      // Đảm bảo return đúng format
      return data.data || data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

const commissionSlice = createSlice({
  name: 'commission',
  initialState: {
    configs: [],
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetLoading: (state) => {
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommissionConfigs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommissionConfigs.fulfilled, (state, action) => {
        state.loading = false;
        state.configs = action.payload || []; 
      })
      .addCase(fetchCommissionConfigs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(createCommissionConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCommissionConfig.fulfilled, (state, action) => {
        state.loading = false;
        // ← FIXED: Kiểm tra action.payload trước khi push
        if (action.payload) {
          state.configs.push(action.payload);
        }
      })
      .addCase(createCommissionConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  }
});

export const { clearError, resetLoading } = commissionSlice.actions;
export default commissionSlice.reducer;