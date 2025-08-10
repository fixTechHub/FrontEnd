import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from './systemReportAPI';

export const submitSystemReportThunk = createAsyncThunk(
  'systemReport/submit',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.submitSystemReport(data);
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Không thể gửi báo cáo');
    }
  }
);

const initialState = {
  loading: false,
  success: null,
  error: null,
};

const systemReportSlice = createSlice({
  name: 'systemReport',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.success = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitSystemReportThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitSystemReportThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(submitSystemReportThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessages } = systemReportSlice.actions;
export default systemReportSlice.reducer;
