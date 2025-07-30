import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchMonthlyRevenue } from './statisticAPI';

export const getMonthlyRevenue = createAsyncThunk(
  'statistics/getMonthlyRevenue',
  async ({ year, month }, thunkAPI) => {
    try {
      return await fetchMonthlyRevenue(year, month);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const statisticSlice = createSlice({
  name: 'statistics',
  initialState: {
    monthlyRevenue: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getMonthlyRevenue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMonthlyRevenue.fulfilled, (state, action) => {
        state.loading = false;
        state.monthlyRevenue = action.payload;
      })
      .addCase(getMonthlyRevenue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default statisticSlice.reducer;
