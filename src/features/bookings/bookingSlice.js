import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  bookings: [],
  selectedBooking: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    status: '',
  },
  pagination: {
    currentPage: 1,
    pageSize: 10,
    total: 0,
  },
};

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    setBookings: (state, action) => {
      state.bookings = action.payload;
    },
    setSelectedBooking: (state, action) => {
      state.selectedBooking = action.payload;
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
    addBooking: (state, action) => {
      state.bookings.push(action.payload);
    },
    updateBooking: (state, action) => {
      const index = state.bookings.findIndex(booking => booking.id === action.payload.id);
      if (index !== -1) {
        state.bookings[index] = action.payload;
      }
    },
    removeBooking: (state, action) => {
      state.bookings = state.bookings.filter(booking => booking.id !== action.payload);
    },
  },
});

export const {
  setBookings,
  setSelectedBooking,
  setLoading,
  setError,
  setFilters,
  setPagination,
  clearFilters,
  addBooking,
  updateBooking,
  removeBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer; 