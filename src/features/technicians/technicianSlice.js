import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getTechnicianProfile, 
         getEarningAndCommission,
         getTechnicianAvailability,
         updateTechnicianAvailability  } from '../technicians/technicianAPI';

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

export const fetchEarningAndCommission = createAsyncThunk(
  'technician/fetchEarningAndCommission',
  async (technicianId, thunkAPI) => {
    try {
      const data = await getEarningAndCommission(technicianId);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const fetchTechnicianAvailability = createAsyncThunk(
  'technician/fetchAvailability',
  async (technicianId, thunkAPI) => {
    try {
      const availability = await getTechnicianAvailability(technicianId);
      return availability;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const changeTechnicianAvailability = createAsyncThunk(
  'technician/changeAvailability',
  async ({ technicianId, status }, thunkAPI) => {
    try {
      const updated = await updateTechnicianAvailability(technicianId, status);
      return updated;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const technicianSlice = createSlice({
  name: 'technician',
  initialState: {
    profile: null,
    earnings: null,
    availability: 'FREE',
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      //Profile
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

      //earning
      .addCase(fetchEarningAndCommission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEarningAndCommission.fulfilled, (state, action) => {
        state.loading = false;
        state.earnings = action.payload.data;
        console.log('earning: ' + state.earnings)
      })
      .addCase(fetchEarningAndCommission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //Availability
      .addCase(fetchTechnicianAvailability.fulfilled, (state, action) => {
        state.availability = action.payload;
        state.error = null;
      })
      .addCase(fetchTechnicianAvailability.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(changeTechnicianAvailability.fulfilled, (state, action) => {
        state.availability = action.payload;
        state.error = null;
      })
      .addCase(changeTechnicianAvailability.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});



export default technicianSlice.reducer;

