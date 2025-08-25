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

// Thêm hàm chuyển đổi status giống như ở TechnicianManagement.jsx
const TECHNICIAN_STATUS_MAP = {
  0: 'PENDING',
  1: 'APPROVED',
  2: 'REJECTED',
  3: 'INACTIVE',
  4: 'PENDING_DELETION',
  5: 'DELETED',
  'PENDING': 'PENDING',
  'APPROVED': 'APPROVED',
  'REJECTED': 'REJECTED',
  'INACTIVE': 'INACTIVE',
  'PENDING_DELETION': 'PENDING_DELETION',
  'DELETED': 'DELETED'
};
function getTechnicianStatus(status) {
  return TECHNICIAN_STATUS_MAP[status] || status || 'Chưa cập nhật';
}

// Derived selectors
export const selectFilteredTechnicians = createSelector(
  [selectTechnicians, selectTechnicianFilters],
  (technicians, filters) => {
    let filteredTechnicians = [...technicians];

    // Filter by search term (giống user)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredTechnicians = filteredTechnicians.filter(
        (technician) =>
          technician.fullName?.toLowerCase().includes(searchTerm) ||
          technician.email?.toLowerCase().includes(searchTerm) ||
          technician.phone?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by status
    if (filters.status) {
      filteredTechnicians = filteredTechnicians.filter(
        (technician) => getTechnicianStatus(technician.status) === filters.status
      );
    }

    // Filter by availability - so sánh cả string và number
    if (filters.availability) {
      filteredTechnicians = filteredTechnicians.filter((technician) => {
        const techAvailability = technician.availability;
        if (filters.availability === '0' && techAvailability !== 0 && techAvailability !== 'ONJOB') return false;
        if (filters.availability === '1' && techAvailability !== 1 && techAvailability !== 'FREE') return false;
        if (filters.availability === '2' && techAvailability !== 2 && techAvailability !== 'BUSY') return false;
        return true;
      });
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