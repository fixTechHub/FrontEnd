import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getReportCounts } from './reportAPI';
const initialState = {
  reports: [],
  selectedReport: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    type: '',
    status: '',
  },
  count: 0,
  pagination: {
    currentPage: 1,
    pageSize: 10,
    total: 0,
  },
};

export const fetchReportCounts = createAsyncThunk(
  'reports/fetchReportCounts',
  async (technicianId, { rejectWithValue }) => {
    try {
      const response = await getReportCounts(technicianId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch report counts');
    }
  }
);

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setReports: (state, action) => {
      state.reports = action.payload;
    },
    setSelectedReport: (state, action) => {
      state.selectedReport = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    addReport: (state, action) => {
      state.reports.push(action.payload);
    },
    updateReport: (state, action) => {
      const index = state.reports.findIndex(report => report.id === action.payload.id);
      if (index !== -1) {
        state.reports[index] = action.payload;
      }
    },
    removeReport: (state, action) => {
      state.reports = state.reports.filter(report => report.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReportCounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReportCounts.fulfilled, (state, action) => {
        state.loading = false;
        state.reportCount = action.payload;
      })
      .addCase(fetchReportCounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setReports,
  setSelectedReport,
  setLoading,
  setError,
  setFilters,
  setPagination,
  clearFilters,
  addReport,
  updateReport,
  removeReport,
} = reportSlice.actions;

export default reportSlice.reducer; 