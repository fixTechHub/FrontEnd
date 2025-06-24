import { createSelector } from '@reduxjs/toolkit';

// Base selectors
export const selectTechnicianState = (state) => state.technicians;

export const selectTechnicians = createSelector(
  [selectTechnicianState],
  (technicianState) => technicianState.technicians
);

export const selectSelectedTechnician = createSelector(
  [selectTechnicianState],
  (technicianState) => technicianState.selectedTechnician
);

export const selectTechnicianLoading = createSelector(
  [selectTechnicianState],
  (technicianState) => technicianState.loading
);

export const selectTechnicianError = createSelector(
  [selectTechnicianState],
  (technicianState) => technicianState.error
);

export const selectTechnicianFilters = createSelector(
  [selectTechnicianState],
  (technicianState) => technicianState.filters
);

export const selectTechnicianPagination = createSelector(
  [selectTechnicianState],
  (technicianState) => technicianState.pagination
);

// Derived selectors
export const selectFilteredTechnicians = createSelector(
  [selectTechnicians, selectTechnicianFilters],
  (technicians, filters) => {
    let filteredTechnicians = [...technicians];

    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredTechnicians = filteredTechnicians.filter(
        (technician) =>
          technician.identification?.toLowerCase().includes(searchTerm) ||
          technician.status?.toLowerCase().includes(searchTerm) ||
          technician.availability?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by status
    if (filters.status) {
      filteredTechnicians = filteredTechnicians.filter(
        (technician) => technician.status === filters.status
      );
    }

    // Filter by availability
    if (filters.availability) {
      filteredTechnicians = filteredTechnicians.filter(
        (technician) => technician.availability === filters.availability
      );
    }

    return filteredTechnicians;
  }
);

export const selectPaginatedTechnicians = createSelector(
  [selectFilteredTechnicians, selectTechnicianPagination],
  (filteredTechnicians, pagination) => {
    const { currentPage, pageSize } = pagination;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredTechnicians.slice(startIndex, endIndex);
  }
);

export const selectTechnicianStats = createSelector(
  [selectTechnicians],
  (technicians) => {
    const totalTechnicians = technicians.length;
    const approvedTechnicians = technicians.filter((technician) => technician.status === 'APPROVED').length;
    const pendingTechnicians = technicians.filter((technician) => technician.status === 'PENDING').length;
    const rejectedTechnicians = technicians.filter((technician) => technician.status === 'REJECTED').length;

    const availabilityStats = technicians.reduce((acc, technician) => {
      acc[technician.availability] = (acc[technician.availability] || 0) + 1;
      return acc;
    }, {});

    const avgRating = technicians.length > 0 
      ? technicians.reduce((sum, technician) => sum + technician.ratingAverage, 0) / technicians.length 
      : 0;

    const totalJobsCompleted = technicians.reduce((sum, technician) => sum + technician.jobCompleted, 0);

    return {
      total: totalTechnicians,
      approved: approvedTechnicians,
      pending: pendingTechnicians,
      rejected: rejectedTechnicians,
      byAvailability: availabilityStats,
      averageRating: avgRating.toFixed(1),
      totalJobsCompleted,
    };
  }
);
