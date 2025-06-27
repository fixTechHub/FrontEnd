import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getTechnicianDepositLogs } from './technicianAPI'; // adjust the path as needed

// Async thunk to fetch technician deposit logs
export const fetchTechnicianDepositLogs = createAsyncThunk(
  'technicianDeposit/fetchTechnicianDepositLogs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getTechnicianDepositLogs();
      return response.data.technicianDepositLogs;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch deposit logs');
    }
  }
);

const technicianDepositSlice = createSlice({
  name: 'technicianDeposit',
  initialState: {
    logs: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTechnicianDepositLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTechnicianDepositLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
      })
      .addCase(fetchTechnicianDepositLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default technicianDepositSlice.reducer;
