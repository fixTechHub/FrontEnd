// Selectors for booking status logs
export const selectAllBookingStatusLogs = (state) => state.bookingStatusLogs.logs;
export const selectSelectedBookingStatusLog = (state) => state.bookingStatusLogs.selectedLog;
export const selectBookingStatusLogsLoading = (state) => state.bookingStatusLogs.loading;
export const selectBookingStatusLogsError = (state) => state.bookingStatusLogs.error;
export const selectBookingStatusLogsFilters = (state) => state.bookingStatusLogs.filters;
export const selectBookingStatusLogsPagination = (state) => state.bookingStatusLogs.pagination;
export const selectBookingStatusLogsSortBy = (state) => state.bookingStatusLogs.sortBy;
export const selectBookingStatusLogsSortOrder = (state) => state.bookingStatusLogs.sortOrder;

// Filtered logs based on search text
export const selectFilteredBookingStatusLogs = (state) => {
    const logs = selectAllBookingStatusLogs(state);
    const filters = selectBookingStatusLogsFilters(state);
    
    if (!filters.search) return logs;
    
    const searchLower = filters.search.toLowerCase();
    return logs.filter(log => {
        const bookingId = (log.bookingId || '').toLowerCase();
        const changedBy = (log.changedBy || '').toLowerCase();
        const role = (log.role || '').toLowerCase();
        const fromStatus = (log.fromStatus || '').toLowerCase();
        const toStatus = (log.toStatus || '').toLowerCase();
        const note = (log.note || '').toLowerCase();
        const bookingCode = (log.bookingCode || '').toLowerCase();
        const changedByUserName = (log.changedByUserName || '').toLowerCase();
        
        return (
            bookingId.includes(searchLower) ||
            changedBy.includes(searchLower) ||
            role.includes(searchLower) ||
            fromStatus.includes(searchLower) ||
            toStatus.includes(searchLower) ||
            note.includes(searchLower) ||
            bookingCode.includes(searchLower) ||
            changedByUserName.includes(searchLower)
        );
    });
};

// Get logs by specific filters
export const selectBookingStatusLogsByBookingId = (state, bookingId) => {
    const logs = selectAllBookingStatusLogs(state);
    return logs.filter(log => log.bookingId === bookingId);
};

export const selectBookingStatusLogsByChangedBy = (state, changedBy) => {
    const logs = selectAllBookingStatusLogs(state);
    return logs.filter(log => log.changedBy === changedBy);
};

export const selectBookingStatusLogsByRole = (state, role) => {
    const logs = selectAllBookingStatusLogs(state);
    return logs.filter(log => log.role === role);
};

export const selectBookingStatusLogsByStatus = (state, status) => {
    const logs = selectAllBookingStatusLogs(state);
    return logs.filter(log => log.fromStatus === status || log.toStatus === status);
};

// Get logs count
export const selectBookingStatusLogsCount = (state) => selectAllBookingStatusLogs(state).length;

// Get logs by date range
export const selectBookingStatusLogsByDateRange = (state, fromDate, toDate) => {
    const logs = selectAllBookingStatusLogs(state);
    if (!fromDate || !toDate) return logs;
    
    return logs.filter(log => {
        const logDate = new Date(log.createdAt);
        return logDate >= fromDate && logDate <= toDate;
    });
};

// Get paginated logs
export const selectPaginatedBookingStatusLogs = (state) => {
    const logs = selectFilteredBookingStatusLogs(state);
    const pagination = selectBookingStatusLogsPagination(state);
    const { currentPage, pageSize } = pagination;
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return logs.slice(startIndex, endIndex);
};

// Get sorted logs
export const selectSortedBookingStatusLogs = (state) => {
    const logs = selectFilteredBookingStatusLogs(state);
    const sortBy = selectBookingStatusLogsSortBy(state);
    const sortOrder = selectBookingStatusLogsSortOrder(state);
    
    return [...logs].sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];
        
        // Handle date sorting
        if (sortBy === 'createdAt') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        }
        
        // Handle string sorting
        if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }
        
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });
};
