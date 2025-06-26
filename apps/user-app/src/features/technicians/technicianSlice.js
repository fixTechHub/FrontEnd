import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getTechnicianProfile,
  getEarningAndCommission,
  getTechnicianAvailability,
  updateTechnicianAvailability,
  getTechnicianJob,
  getJobDetails,
  getTechnicians, completeTechnicianProfile
} from '../technicians/technicianAPI';

export const fetchTechnicianProfile = createAsyncThunk(
  'technician/fetchProfile',
  async (technicianId, thunkAPI) => {
    try {
      const data = await getTechnicianProfile(technicianId);
      console.log('--- FETCH TECHNICIAN PROFILE ---', data);

      return data.data; // giữ nguyên trả về { success, data }
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

export const fetchTechnicians = createAsyncThunk(
  'technician/fetchList',
  async (thunkAPI) => {
    try {
      const data = await getTechnicians();
      return data.data;}
      catch (error){
        return thunkAPI.rejectWithValue(
          error.response?.data?.message || error.message)
      }
    }
  )
export const completeTechnicianProfileThunk = createAsyncThunk(
  'technician/completeProfile',
  async (technicianData, thunkAPI) => {
    try {
      const data = await completeTechnicianProfile(technicianData);
      return data.data;}
      catch (error){
        return thunkAPI.rejectWithValue(
          error.response?.data?.message || error.message)
      }
    }
  )

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

export const fetchTechnicianJobDetails = createAsyncThunk(
  'technician/fetchTechnicianJobDetails',
  async ({ technicianId, bookingId }, { rejectWithValue }) => {
    try {
      const data = await getJobDetails(technicianId, bookingId);
      console.log(data);
      return data;

    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchTechnicianJobs = createAsyncThunk(
  'technician/fetchTechnicianJobs',
  async (technicianId, { rejectWithValue }) => {
    try {
      const data = await getTechnicianJob(technicianId);
      console.log(data);
      return data;

    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
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
    error: null,
    bookings: [],
    jobDetail: null,
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
        state.profile = action.payload;
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
      })

      //Jobs
      .addCase(fetchTechnicianJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTechnicianJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.data || action.payload.bookings || [];
      })
      .addCase(fetchTechnicianJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch bookings';
      })

      //JobDetails
      .addCase(fetchTechnicianJobDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTechnicianJobDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.jobDetail = action.payload;
      })
      .addCase(fetchTechnicianJobDetails.rejected, (state, action) => {
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
      });
  }
});



export default technicianSlice.reducer;

