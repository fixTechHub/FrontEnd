import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingStatusLogAPI } from './bookingStatusLogAPI';

// Async thunks
export const getAllBookingStatusLogs = createAsyncThunk(
  'bookingStatusLogs/getAll',
  async (_, thunkAPI) => {
    try {
      return await bookingStatusLogAPI.getAll();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getBookingStatusLogById = createAsyncThunk(
  'bookingStatusLogs/getById',
  async (id, thunkAPI) => {
    try {
      return await bookingStatusLogAPI.getById(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getBookingStatusLogsByBookingId = createAsyncThunk(
  'bookingStatusLogs/getByBookingId',
  async (bookingId, thunkAPI) => {
    try {
      return await bookingStatusLogAPI.getByBookingId(bookingId);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getBookingStatusLogsByChangedBy = createAsyncThunk(
  'bookingStatusLogs/getByChangedBy',
  async (changedBy, thunkAPI) => {
    try {
      return await bookingStatusLogAPI.getByChangedBy(changedBy);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getBookingStatusLogsByRole = createAsyncThunk(
  'bookingStatusLogs/getByRole',
  async (role, thunkAPI) => {
    try {
      return await bookingStatusLogAPI.getByRole(role);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getBookingStatusLogsByDateRange = createAsyncThunk(
  'bookingStatusLogs/getByDateRange',
  async ({ fromDate, toDate }, thunkAPI) => {
    try {
      return await bookingStatusLogAPI.getByDateRange(fromDate, toDate);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getFilteredBookingStatusLogs = createAsyncThunk(
  'bookingStatusLogs/getFiltered',
  async (filter, thunkAPI) => {
    try {
      return await bookingStatusLogAPI.getFiltered(filter);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getBookingHistory = createAsyncThunk(
  'bookingStatusLogs/getBookingHistory',
  async (bookingId, thunkAPI) => {
    try {
      return await bookingStatusLogAPI.getBookingHistory(bookingId);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  logs: [],
  selectedLog: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    bookingId: '',
    changedBy: '',
    role: '',
    fromStatus: '',
    toStatus: '',
    fromDate: null,
    toDate: null,
  },
  pagination: {
    currentPage: 1,
    pageSize: 10,
    total: 0,
  },
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

const bookingStatusLogSlice = createSlice({
  name: 'bookingStatusLogs',
  initialState,
  reducers: {
    setLogs: (state, action) => {
      state.logs = action.payload;
    },
    setSelectedLog: (state, action) => {
      state.selectedLog = action.payload;
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
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // GetAll
      .addCase(getAllBookingStatusLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllBookingStatusLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
        state.error = null;
      })
      .addCase(getAllBookingStatusLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // GetById
      .addCase(getBookingStatusLogById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookingStatusLogById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedLog = action.payload;
        state.error = null;
      })
      .addCase(getBookingStatusLogById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // GetByBookingId
      .addCase(getBookingStatusLogsByBookingId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookingStatusLogsByBookingId.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
        state.error = null;
      })
      .addCase(getBookingStatusLogsByBookingId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // GetByChangedBy
      .addCase(getBookingStatusLogsByChangedBy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookingStatusLogsByChangedBy.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
        state.error = null;
      })
      .addCase(getBookingStatusLogsByChangedBy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // GetByRole
      .addCase(getBookingStatusLogsByRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookingStatusLogsByRole.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
        state.error = null;
      })
      .addCase(getBookingStatusLogsByRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // GetByDateRange
      .addCase(getBookingStatusLogsByDateRange.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookingStatusLogsByDateRange.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
        state.error = null;
      })
      .addCase(getBookingStatusLogsByDateRange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // GetFiltered
      .addCase(getFilteredBookingStatusLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFilteredBookingStatusLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload.items;
        state.pagination.total = action.payload.totalCount;
        state.pagination.currentPage = action.payload.page;
        state.pagination.pageSize = action.payload.pageSize;
        state.error = null;
      })
      .addCase(getFilteredBookingStatusLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // GetBookingHistory
      .addCase(getBookingHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookingHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
        state.error = null;
      })
      .addCase(getBookingHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setLogs,
  setSelectedLog,
  setLoading,
  setError,
  setFilters,
  setPagination,
  setSortBy,
  setSortOrder,
  clearFilters,
  clearError,
} = bookingStatusLogSlice.actions;

export default bookingStatusLogSlice.reducer;
