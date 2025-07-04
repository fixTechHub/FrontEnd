import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { serviceAPI } from './serviceAPI';

// Async thunks
export const fetchServices = createAsyncThunk(
  'service/fetchServices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await serviceAPI.getAll();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createService = createAsyncThunk(
  'service/createService',
  async (serviceData, { dispatch, rejectWithValue }) => {
    try {
      const response = await serviceAPI.create(serviceData);
      dispatch(fetchServices());
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateService = createAsyncThunk(
  'service/updateService',
  async ({ id, serviceData }, { dispatch, rejectWithValue }) => {
    try {
      const response = await serviceAPI.update(id, serviceData);
      dispatch(fetchServices());
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteService = createAsyncThunk(
  'service/deleteService',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await serviceAPI.delete(id);
      dispatch(fetchServices());
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  services: [],
  selectedService: null,
  loading: false,
  error: null,
  success: false,
};

const serviceSlice = createSlice({
  name: 'service',
  initialState,
  reducers: {
    resetServiceState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.selectedService = null;
    },
    setSelectedService: (state, action) => {
      state.selectedService = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Services
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Service
      .addCase(createService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createService.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Service
      .addCase(updateService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateService.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(updateService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Service
      .addCase(deleteService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteService.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetServiceState, setSelectedService } = serviceSlice.actions;
export default serviceSlice.reducer; 