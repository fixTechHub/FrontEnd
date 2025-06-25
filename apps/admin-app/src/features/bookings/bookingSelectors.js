import { createSelector } from '@reduxjs/toolkit';

// Base selectors
export const selectBookingState = (state) => state.bookings;

export const selectBookings = createSelector(
  [selectBookingState],
  (bookingState) => bookingState.bookings
);

export const selectSelectedBooking = createSelector(
  [selectBookingState],
  (bookingState) => bookingState.selectedBooking
);

export const selectBookingLoading = createSelector(
  [selectBookingState],
  (bookingState) => bookingState.loading
);

export const selectBookingError = createSelector(
  [selectBookingState],
  (bookingState) => bookingState.error
);

export const selectBookingFilters = createSelector(
  [selectBookingState],
  (bookingState) => bookingState.filters
);

export const selectBookingPagination = createSelector(
  [selectBookingState],
  (bookingState) => bookingState.pagination
);

// Derived selectors
export const selectFilteredBookings = createSelector(
  [selectBookings, selectBookingFilters],
  (bookings, filters) => {
    let filteredBookings = [...bookings];

    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredBookings = filteredBookings.filter(
        (booking) =>
          booking.description?.toLowerCase().includes(searchTerm) ||
          booking.bookingCode?.toLowerCase().includes(searchTerm) ||
          booking.status?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by status
    if (filters.status) {
      filteredBookings = filteredBookings.filter(
        (booking) => booking.status === filters.status
      );
    }

    return filteredBookings;
  }
);

export const selectPaginatedBookings = createSelector(
  [selectFilteredBookings, selectBookingPagination],
  (filteredBookings, pagination) => {
    const { currentPage, pageSize } = pagination;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredBookings.slice(startIndex, endIndex);
  }
); 