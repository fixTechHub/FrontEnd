import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { financialReportAPI } from './financialReportAPI';

// Async thunks
export const fetchFinancialSummary = createAsyncThunk(
  'financialReport/fetchFinancialSummary',
  async (_, { rejectWithValue }) => {
    try {
      return await financialReportAPI.getFinancialSummary();
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch financial summary');
    }
  }
);

export const fetchAllBookingsFinancial = createAsyncThunk(
  'financialReport/fetchAllBookingsFinancial',
  async (_, { rejectWithValue }) => {
    try {
      return await financialReportAPI.getAllBookingsFinancial();
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch bookings financial data');
    }
  }
);

export const fetchAllTechniciansFinancialSummary = createAsyncThunk(
  'financialReport/fetchAllTechniciansFinancialSummary',
  async (_, { rejectWithValue }) => {
    try {
      return await financialReportAPI.getAllTechniciansFinancialSummary();
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch technicians financial summary');
    }
  }
);

export const fetchTechnicianFinancialDetails = createAsyncThunk(
  'financialReport/fetchTechnicianFinancialDetails',
  async (technicianId, { rejectWithValue }) => {
    try {
      return await financialReportAPI.getTechnicianFinancialDetails(technicianId);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch technician financial details');
    }
  }
);

export const fetchBookingsByTechnicianId = createAsyncThunk(
  'financialReport/fetchBookingsByTechnicianId',
  async (technicianId, { rejectWithValue }) => {
    try {
      return await financialReportAPI.getBookingsByTechnicianId(technicianId);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch technician bookings');
    }
  }
);

export const fetchTotalRevenue = createAsyncThunk(
  'financialReport/fetchTotalRevenue',
  async (_, { rejectWithValue }) => {
    try {
      return await financialReportAPI.getTotalRevenue();
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch total revenue');
    }
  }
);

export const fetchTotalHoldingAmount = createAsyncThunk(
  'financialReport/fetchTotalHoldingAmount',
  async (_, { rejectWithValue }) => {
    try {
      return await financialReportAPI.getTotalHoldingAmount();
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch total holding amount');
    }
  }
);

export const fetchTotalCommissionAmount = createAsyncThunk(
  'financialReport/fetchTotalCommissionAmount',
  async (_, { rejectWithValue }) => {
    try {
      return await financialReportAPI.getTotalCommissionAmount();
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch total commission amount');
    }
  }
);

export const fetchTotalTechnicianEarning = createAsyncThunk(
  'financialReport/fetchTotalTechnicianEarning',
  async (_, { rejectWithValue }) => {
    try {
      return await financialReportAPI.getTotalTechnicianEarning();
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch total technician earning');
    }
  }
);

export const fetchTotalWithdrawn = createAsyncThunk(
  'financialReport/fetchTotalWithdrawn',
  async (_, { rejectWithValue }) => {
    try {
      return await financialReportAPI.getTotalWithdrawn();
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch total withdrawn');
    }
  }
);

const initialState = {
  financialSummary: null,
  bookingsFinancial: [],
  techniciansFinancialSummary: [],
  selectedTechnicianDetails: null,
  selectedTechnicianBookings: [],
  totalRevenue: 0,
  totalHoldingAmount: 0,
  totalCommissionAmount: 0,
  totalTechnicianEarning: 0,
  totalWithdrawn: 0,
  loading: false,
  error: null,
  selectedTechnicianId: null
};

const financialReportSlice = createSlice({
  name: 'financialReport',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedTechnicianId: (state, action) => {
      state.selectedTechnicianId = action.payload;
    },
    clearSelectedTechnician: (state) => {
      state.selectedTechnicianDetails = null;
      state.selectedTechnicianBookings = [];
      state.selectedTechnicianId = null;
    }
  },
  extraReducers: (builder) => {
    // Financial Summary
    builder
      .addCase(fetchFinancialSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFinancialSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.financialSummary = action.payload;
      })
      .addCase(fetchFinancialSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // All Bookings Financial
    builder
      .addCase(fetchAllBookingsFinancial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBookingsFinancial.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingsFinancial = action.payload;
      })
      .addCase(fetchAllBookingsFinancial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // All Technicians Financial Summary
    builder
      .addCase(fetchAllTechniciansFinancialSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTechniciansFinancialSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.techniciansFinancialSummary = action.payload;
      })
      .addCase(fetchAllTechniciansFinancialSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Technician Financial Details
    builder
      .addCase(fetchTechnicianFinancialDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTechnicianFinancialDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTechnicianDetails = action.payload;
      })
      .addCase(fetchTechnicianFinancialDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Bookings By Technician ID
    builder
      .addCase(fetchBookingsByTechnicianId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingsByTechnicianId.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTechnicianBookings = action.payload;
      })
      .addCase(fetchBookingsByTechnicianId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Total Revenue
    builder
      .addCase(fetchTotalRevenue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTotalRevenue.fulfilled, (state, action) => {
        state.loading = false;
        state.totalRevenue = action.payload;
      })
      .addCase(fetchTotalRevenue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Total Holding Amount
    builder
      .addCase(fetchTotalHoldingAmount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTotalHoldingAmount.fulfilled, (state, action) => {
        state.loading = false;
        state.totalHoldingAmount = action.payload;
      })
      .addCase(fetchTotalHoldingAmount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Total Commission Amount
    builder
      .addCase(fetchTotalCommissionAmount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTotalCommissionAmount.fulfilled, (state, action) => {
        state.loading = false;
        state.totalCommissionAmount = action.payload;
      })
      .addCase(fetchTotalCommissionAmount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Total Technician Earning
    builder
      .addCase(fetchTotalTechnicianEarning.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTotalTechnicianEarning.fulfilled, (state, action) => {
        state.loading = false;
        state.totalTechnicianEarning = action.payload;
      })
      .addCase(fetchTotalTechnicianEarning.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Total Withdrawn
    builder
      .addCase(fetchTotalWithdrawn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTotalWithdrawn.fulfilled, (state, action) => {
        state.loading = false;
        state.totalWithdrawn = action.payload;
      })
      .addCase(fetchTotalWithdrawn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setSelectedTechnicianId, clearSelectedTechnician } = financialReportSlice.actions;
export default financialReportSlice.reducer;