import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { commissionConfigAPI } from './commissionAPI';

// Async thunks
export const fetchCommissionConfigs = createAsyncThunk(
  'commissionConfig/fetchCommissionConfigs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await commissionConfigAPI.getAll();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createCommissionConfig = createAsyncThunk(
  'commissionConfig/createCommissionConfig',
  async (commissionConfigData, { dispatch, rejectWithValue }) => {
    try {
      const response = await commissionConfigAPI.create(commissionConfigData);
      dispatch(fetchCommissionConfigs());
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCommissionConfig = createAsyncThunk(
  'commissionConfig/updateCommissionConfig',
  async ({ id, commissionConfigData }, { dispatch, rejectWithValue }) => {
    try {
      const response = await commissionConfigAPI.update(id, commissionConfigData);
      dispatch(fetchCommissionConfigs());
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteCommissionConfig = createAsyncThunk(
  'commissionConfig/deleteCommissionConfig',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await commissionConfigAPI.delete(id);
      dispatch(fetchCommissionConfigs());
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchDeletedCommissionConfigs = createAsyncThunk(
  'commissionConfig/fetchDeletedCommissionConfigs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await commissionConfigAPI.getDeleted();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const restoreCommissionConfig = createAsyncThunk(
  'commissionConfig/restoreCommissionConfig',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await commissionConfigAPI.restore(id);
      dispatch(fetchCommissionConfigs());
      dispatch(fetchDeletedCommissionConfigs());
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  commissionConfigs: [],
  deletedCommissionConfigs: [],
  selectedCommissionConfig: null,
  loading: false,
  error: null,
  success: false,
};

const commissionConfigSlice = createSlice({
  name: 'commissionConfig',
  initialState,
  reducers: {
    resetState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.selectedCommissionConfig = null;
    },
    setSelectedCommissionConfig: (state, action) => {
      state.selectedCommissionConfig = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch CommissionConfigs
      .addCase(fetchCommissionConfigs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommissionConfigs.fulfilled, (state, action) => {
        state.loading = false;
        state.commissionConfigs = action.payload;
      })
      .addCase(fetchCommissionConfigs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create CommissionConfig
      .addCase(createCommissionConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCommissionConfig.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createCommissionConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update CommissionConfig
      .addCase(updateCommissionConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCommissionConfig.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(updateCommissionConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete CommissionConfig
      .addCase(deleteCommissionConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCommissionConfig.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(deleteCommissionConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Deleted CommissionConfigs
      .addCase(fetchDeletedCommissionConfigs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeletedCommissionConfigs.fulfilled, (state, action) => {
        state.loading = false;
        state.deletedCommissionConfigs = action.payload;
      })
      .addCase(fetchDeletedCommissionConfigs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Restore CommissionConfig
      .addCase(restoreCommissionConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreCommissionConfig.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(restoreCommissionConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetState, setSelectedCommissionConfig } = commissionConfigSlice.actions;
export default commissionConfigSlice.reducer; 