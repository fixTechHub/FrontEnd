import { createSelector } from '@reduxjs/toolkit';

// Base selectors
export const selectSystemReportState = (state) => state.systemReports;

export const selectSystemReports = createSelector(
  [selectSystemReportState],
  (systemReportState) => systemReportState.systemReports
);

export const selectSelectedSystemReport = createSelector(
  [selectSystemReportState],
  (systemReportState) => systemReportState.selectedSystemReport
);

export const selectSystemReportLoading = createSelector(
  [selectSystemReportState],
  (systemReportState) => systemReportState.loading
);

export const selectSystemReportError = createSelector(
  [selectSystemReportState],
  (systemReportState) => systemReportState.error
);

export const selectSystemReportFilters = createSelector(
  [selectSystemReportState],
  (systemReportState) => systemReportState.filters
);

export const selectSystemReportPagination = createSelector(
  [selectSystemReportState],
  (systemReportState) => systemReportState.pagination
);

// Derived selectors
export const selectFilteredSystemReports = createSelector(
  [selectSystemReports, selectSystemReportFilters],
  (systemReports, filters) => {
    let filteredSystemReports = [...systemReports];

    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredSystemReports = filteredSystemReports.filter(
        (report) =>
          report.title?.toLowerCase().includes(searchTerm) ||
          report.description?.toLowerCase().includes(searchTerm) ||
          report.tag?.toLowerCase().includes(searchTerm) ||
          report.status?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by tag
    if (filters.tag) {
      filteredSystemReports = filteredSystemReports.filter(
        (report) => report.tag === filters.tag
      );
    }

    // Filter by status
    if (filters.status) {
      filteredSystemReports = filteredSystemReports.filter(
        (report) => report.status === filters.status
      );
    }

    return filteredSystemReports;
  }
);

export const selectPaginatedSystemReports = createSelector(
  [selectFilteredSystemReports, selectSystemReportPagination],
  (filteredSystemReports, pagination) => {
    const { currentPage, pageSize } = pagination;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredSystemReports.slice(startIndex, endIndex);
  }
);

export const selectSystemReportStats = createSelector(
  [selectSystemReports],
  (systemReports) => {
    const totalReports = systemReports.length;
    const pendingReports = systemReports.filter((report) => report.status === 'pending').length;
    const resolvedReports = systemReports.filter((report) => report.status === 'resolved').length;
    const rejectedReports = systemReports.filter((report) => report.status === 'rejected').length;

    const tagStats = systemReports.reduce((acc, report) => {
      acc[report.tag] = (acc[report.tag] || 0) + 1;
      return acc;
    }, {});

    return {
      total: totalReports,
      pending: pendingReports,
      resolved: resolvedReports,
      rejected: rejectedReports,
      byTag: tagStats,
    };
  }
); 