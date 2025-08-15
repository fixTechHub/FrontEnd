import { createSelector } from '@reduxjs/toolkit';

// Base selectors
export const selectWarrantyState = (state) => state.warranties;

export const selectWarranties = createSelector(
  [selectWarrantyState],
  (warrantyState) => warrantyState?.warranties || []
);

export const selectSelectedWarranty = createSelector(
  [selectWarrantyState],
  (warrantyState) => warrantyState.selectedWarranty
);

export const selectWarrantyLoading = createSelector(
  [selectWarrantyState],
  (warrantyState) => warrantyState.loading
);

export const selectWarrantyError = createSelector(
  [selectWarrantyState],
  (warrantyState) => warrantyState.error
);

export const selectWarrantyFilters = createSelector(
  [selectWarrantyState],
  (warrantyState) => warrantyState.filters
);

export const selectWarrantyPagination = createSelector(
  [selectWarrantyState],
  (warrantyState) => warrantyState.pagination
);

// Derived selectors
export const selectFilteredWarranties = createSelector(
  [selectWarranties, selectWarrantyFilters],
  (warranties, filters) => {
    // Ensure warranties is always an array
    const warrantiesArray = Array.isArray(warranties) ? warranties : [];
    let filteredWarranties = [...warrantiesArray];

    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredWarranties = filteredWarranties.filter(
        (warranty) =>
          warranty.description?.toLowerCase().includes(searchTerm) ||
          warranty.status?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by status
    if (filters.status) {
      filteredWarranties = filteredWarranties.filter(
        (warranty) => warranty.status === filters.status
      );
    }

    return filteredWarranties;
  }
);

export const selectPaginatedWarranties = createSelector(
  [selectFilteredWarranties, selectWarrantyPagination],
  (filteredWarranties, pagination) => {
    const { currentPage, pageSize } = pagination;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredWarranties.slice(startIndex, endIndex);
  }
);

export const selectWarrantyStats = createSelector(
  [selectWarranties],
  (warranties) => {
    const totalWarranties = warranties.length;
    const pendingWarranties = warranties.filter((w) => w.status?.toUpperCase() === 'PENDING').length;
    const approvedWarranties = warranties.filter((w) => w.status?.toUpperCase() === 'APPROVED').length;
    const rejectedWarranties = warranties.filter((w) => w.status?.toUpperCase() === 'REJECTED').length;

    return {
      total: totalWarranties,
      pending: pendingWarranties,
      approved: approvedWarranties,
      rejected: rejectedWarranties,
    };
  }
);
