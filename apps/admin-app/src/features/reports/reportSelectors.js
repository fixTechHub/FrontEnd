import { createSelector } from '@reduxjs/toolkit';

// Base selectors
export const selectReportState = (state) => state.reports;

export const selectReports = createSelector(
  [selectReportState],
  (reportState) => reportState.reports
);

export const selectSelectedReport = createSelector(
  [selectReportState],
  (reportState) => reportState.selectedReport
);

export const selectReportLoading = createSelector(
  [selectReportState],
  (reportState) => reportState.loading
);

export const selectReportError = createSelector(
  [selectReportState],
  (reportState) => reportState.error
);

export const selectReportFilters = createSelector(
  [selectReportState],
  (reportState) => reportState.filters
);

export const selectReportPagination = createSelector(
  [selectReportState],
  (reportState) => reportState.pagination
);

// Derived selectors
export const selectFilteredReports = createSelector(
  [selectReports, selectReportFilters],
  (reports, filters) => {
    let filteredReports = [...reports];

    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredReports = filteredReports.filter(
        (report) =>
          report.description?.toLowerCase().includes(searchTerm) ||
          report.type?.toLowerCase().includes(searchTerm) ||
          report.status?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by type
    if (filters.type) {
      filteredReports = filteredReports.filter(
        (report) => report.type === filters.type
      );
    }

    // Filter by status
    if (filters.status) {
      filteredReports = filteredReports.filter(
        (report) => report.status === filters.status
      );
    }

    return filteredReports;
  }
);

export const selectPaginatedReports = createSelector(
  [selectFilteredReports, selectReportPagination],
  (filteredReports, pagination) => {
    const { currentPage, pageSize } = pagination;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredReports.slice(startIndex, endIndex);
  }
);

export const selectReportStats = createSelector(
  [selectReports],
  (reports) => {
    const totalReports = reports.length;
    const pendingReports = reports.filter((report) => report.status === 'pending').length;
    const resolvedReports = reports.filter((report) => report.status === 'resolved').length;
    const rejectedReports = reports.filter((report) => report.status === 'rejected').length;

    const typeStats = reports.reduce((acc, report) => {
      acc[report.type] = (acc[report.type] || 0) + 1;
      return acc;
    }, {});

    return {
      total: totalReports,
      pending: pendingReports,
      resolved: resolvedReports,
      rejected: rejectedReports,
      byType: typeStats,
    };
  }
); 