import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  systemReports: [],
  selectedSystemReport: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    tag: '',
    status: '',
  },
  pagination: {
    currentPage: 1,
    pageSize: 10,
    total: 0,
  },
};

const systemReportSlice = createSlice({
  name: 'systemReports',
  initialState,
  reducers: {
    setSystemReports: (state, action) => {
      state.systemReports = action.payload;
    },
    setSelectedSystemReport: (state, action) => {
      state.selectedSystemReport = action.payload;
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
    addSystemReport: (state, action) => {
      state.systemReports.push(action.payload);
    },
    updateSystemReport: (state, action) => {
      const index = state.systemReports.findIndex(report => report.id === action.payload.id);
      if (index !== -1) {
        state.systemReports[index] = action.payload;
      }
    },
    removeSystemReport: (state, action) => {
      state.systemReports = state.systemReports.filter(report => report.id !== action.payload);
    },
  },
});

export const {
  setSystemReports,
  setSelectedSystemReport,
  setLoading,
  setError,
  setFilters,
  setPagination,
  clearFilters,
  addSystemReport,
  updateSystemReport,
  removeSystemReport,
} = systemReportSlice.actions;

export default systemReportSlice.reducer; 