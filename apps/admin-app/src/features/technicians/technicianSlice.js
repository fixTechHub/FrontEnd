import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  technicians: [],
  selectedTechnician: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    status: '',
    availability: '',
  },
  pagination: {
    currentPage: 1,
    pageSize: 10,
    total: 0,
  },
};

const technicianSlice = createSlice({
  name: 'technicians',
  initialState,
  reducers: {
    setTechnicians: (state, action) => {
      state.technicians = action.payload;
    },
    setSelectedTechnician: (state, action) => {
      state.selectedTechnician = action.payload;
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
    addTechnician: (state, action) => {
      state.technicians.push(action.payload);
    },
    updateTechnician: (state, action) => {
      const index = state.technicians.findIndex(technician => technician.id === action.payload.id);
      if (index !== -1) {
        state.technicians[index] = action.payload;
      }
    },
    removeTechnician: (state, action) => {
      state.technicians = state.technicians.filter(technician => technician.id !== action.payload);
    },
  },
});

export const {
  setTechnicians,
  setSelectedTechnician,
  setLoading,
  setError,
  setFilters,
  setPagination,
  clearFilters,
  addTechnician,
  updateTechnician,
  removeTechnician,
} = technicianSlice.actions;

export default technicianSlice.reducer;