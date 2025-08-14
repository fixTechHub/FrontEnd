import { createSelector } from '@reduxjs/toolkit';

// Base selectors
export const selectCouponUsageState = (state) => state.couponUsages;

export const selectCouponUsages = createSelector(
  [selectCouponUsageState],
  (couponUsageState) => couponUsageState?.couponUsages || []
);

export const selectSelectedCouponUsage = createSelector(
  [selectCouponUsageState],
  (couponUsageState) => couponUsageState.selectedCouponUsage
);

export const selectCouponUsageLoading = createSelector(
  [selectCouponUsageState],
  (couponUsageState) => couponUsageState.loading
);

export const selectCouponUsageError = createSelector(
  [selectCouponUsageState],
  (couponUsageState) => couponUsageState.error
);

export const selectCouponUsageFilters = createSelector(
  [selectCouponUsageState],
  (couponUsageState) => couponUsageState.filters
);

export const selectCouponUsagePagination = createSelector(
  [selectCouponUsageState],
  (couponUsageState) => couponUsageState.pagination
);

// Derived selectors
export const selectFilteredCouponUsages = createSelector(
  [selectCouponUsages, selectCouponUsageFilters],
  (couponUsages, filters) => {
    // Ensure couponUsages is always an array
    const couponUsagesArray = Array.isArray(couponUsages) ? couponUsages : [];
    let filteredCouponUsages = [...couponUsagesArray];

    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredCouponUsages = filteredCouponUsages.filter(
        (couponUsage) =>
          couponUsage.couponCode?.toLowerCase().includes(searchTerm) ||
          couponUsage.status?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by status
    if (filters.status) {
      filteredCouponUsages = filteredCouponUsages.filter(
        (couponUsage) => couponUsage.status === filters.status
      );
    }

    return filteredCouponUsages;
  }
);

export const selectPaginatedCouponUsages = createSelector(
  [selectFilteredCouponUsages, selectCouponUsagePagination],
  (filteredCouponUsages, pagination) => {
    const { currentPage, pageSize } = pagination;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredCouponUsages.slice(startIndex, endIndex);
  }
);

export const selectCouponUsageStats = createSelector(
  [selectCouponUsages],
  (couponUsages) => {
    const totalCouponUsages = couponUsages.length;
    const activeCouponUsages = couponUsages.filter((cu) => cu.status?.toUpperCase() === 'ACTIVE').length;
    const usedCouponUsages = couponUsages.filter((cu) => cu.status?.toUpperCase() === 'USED').length;
    const expiredCouponUsages = couponUsages.filter((cu) => cu.status?.toUpperCase() === 'EXPIRED').length;

    return {
      total: totalCouponUsages,
      active: activeCouponUsages,
      used: usedCouponUsages,
      expired: expiredCouponUsages,
    };
  }
);
