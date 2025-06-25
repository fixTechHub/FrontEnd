import { createSelector } from '@reduxjs/toolkit';

// Base selectors
export const selectUserState = (state) => state.users;

export const selectUsers = createSelector(
  [selectUserState],
  (userState) => userState.users
);

export const selectSelectedUser = createSelector(
  [selectUserState],
  (userState) => userState.selectedUser
);

export const selectUserLoading = createSelector(
  [selectUserState],
  (userState) => userState.loading
);

export const selectUserError = createSelector(
  [selectUserState],
  (userState) => userState.error
);

export const selectUserFilters = createSelector(
  [selectUserState],
  (userState) => userState.filters
);

export const selectUserPagination = createSelector(
  [selectUserState],
  (userState) => userState.pagination
);

// Derived selectors
export const selectFilteredUsers = createSelector(
  [selectUsers, selectUserFilters],
  (users, filters) => {
    let filteredUsers = [...users];

    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.fullName?.toLowerCase().includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm) ||
          user.phone?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by role
    if (filters.role) {
      filteredUsers = filteredUsers.filter(
        (user) => user.role === filters.role
      );
    }

    // Filter by status
    if (filters.status) {
      filteredUsers = filteredUsers.filter(
        (user) => user.status === filters.status
      );
    }

    return filteredUsers;
  }
);

export const selectPaginatedUsers = createSelector(
  [selectFilteredUsers, selectUserPagination],
  (filteredUsers, pagination) => {
    const { currentPage, pageSize } = pagination;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredUsers.slice(startIndex, endIndex);
  }
);

export const selectUserStats = createSelector(
  [selectUsers],
  (users) => {
    const totalUsers = users.length;
    const activeUsers = users.filter((user) => user.status === 'Active').length;
    const inactiveUsers = totalUsers - activeUsers;

    const roleStats = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    return {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
      byRole: roleStats,
    };
  }
); 