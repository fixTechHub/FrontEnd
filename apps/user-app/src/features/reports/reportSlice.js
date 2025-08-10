import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as reportAPI from './reportAPI';

// Async thunks
export const createReportThunk = createAsyncThunk(
  'report/createReport',
  async (reportData, { rejectWithValue }) => {
    try {
      const response = await reportAPI.createReport(reportData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Tạo báo cáo thất bại');
    }
  }
);

export const getReportByIdThunk = createAsyncThunk(
  'report/getReportById',
  async (reportId, { rejectWithValue }) => {
    try {
      const response = await reportAPI.getReportById(reportId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy thông tin báo cáo');
    }
  }
);

const initialState = {
  reports: [],
  currentReport: null,
  loading: false,
  error: null,
  success: null,
};

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearCurrentReport: (state) => {
      state.currentReport = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Report
      .addCase(createReportThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReportThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        state.reports.unshift(action.payload.data);
      })
      .addCase(createReportThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Report By ID
      .addCase(getReportByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReportByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReport = action.payload.data;
      })
      .addCase(getReportByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export const { clearError, clearSuccess, clearCurrentReport } = reportSlice.actions;
export default reportSlice.reducer; 