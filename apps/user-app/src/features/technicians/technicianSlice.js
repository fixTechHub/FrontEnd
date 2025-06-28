import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getTechnicianProfile, getTechnicians, completeTechnicianProfile, sendQuotationAPI, getTechnicianDepositLogs } from '../technicians/technicianAPI';

export const fetchTechnicianProfile = createAsyncThunk(
  'technician/fetchProfile',
  async (technicianId, thunkAPI) => {
    try {
      const data = await getTechnicianProfile(technicianId);
      console.log('--- FETCH TECHNICIAN PROFILE ---', data);

      return data; // giữ nguyên trả về { success, data }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);


export const fetchTechnicians = createAsyncThunk(
  'technician/fetchList',
  async (thunkAPI) => {
    try {
      const data = await getTechnicians();
      return data.data;
    }
    catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message)
    }
  }
);

export const completeTechnicianProfileThunk = createAsyncThunk(
  'technician/completeProfile',
  async (technicianData, thunkAPI) => {
    try {
      const data = await completeTechnicianProfile(technicianData);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const sendQuotation = createAsyncThunk(
  'technician/sendQuotation',
  async (formData, thunkAPI) => {
    try {
      const res = await sendQuotationAPI(formData);
      console.log('--- SEND QUOTATION ---', res.data);

      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const fetchTechnicianDepositLogs = createAsyncThunk(
  'technician/fetchTechnicianDepositLogs',
  async ({ limit, skip }, { rejectWithValue }) => {
    try {
      const response = await getTechnicianDepositLogs({ limit, skip });
      console.log('Data', response.data);
      return response.data.technicianDepositLogs;
    } catch (error) {
      console.error('Thunk Error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch deposit logs');
    }
  }
);

const technicianSlice = createSlice({
  name: 'technician',
  initialState: {
    profile: null,
    quotations: [],
    loading: false,
    error: null,
    logs: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTechnicianProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTechnicianProfile.fulfilled, (state, action) => {
        state.loading = false;

        const payload = action.payload;

        console.log('Received payload:', payload);
        state.profile = {
          technician: payload.data[0],
          certificates: payload.data[1]
        };
      })
      .addCase(fetchTechnicianProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchTechnicians.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTechnicians.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchTechnicians.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(completeTechnicianProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeTechnicianProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(completeTechnicianProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Send Quotation
      .addCase(sendQuotation.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(sendQuotation.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.quotations.unshift(action.payload);
      })
      .addCase(sendQuotation.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

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
  }
});

export default technicianSlice.reducer;
