import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getTechnicianProfile,getTechnicians } from '../technicians/technicianAPI';

export const fetchTechnicianProfile = createAsyncThunk(
  'technician/fetchProfile',
  async (technicianId, thunkAPI) => {
    try {
      const data = await getTechnicianProfile(technicianId);
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
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

const technicianSlice = createSlice({
  name: 'technician',
  initialState: {
    profile: null,
    loading: false,
    error: null
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
  }
});

export default technicianSlice.reducer;
