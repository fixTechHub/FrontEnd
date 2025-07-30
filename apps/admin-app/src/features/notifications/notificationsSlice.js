import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sendNotifications } from './notificationsAPI';

export const sendNotificationsThunk = createAsyncThunk(
  'notification/sendNotificationsThunk',
  async (notifyData, { rejectWithValue }) => {
    try {
      const response = await sendNotifications(notifyData);
      return response.data.notification;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to sending notifications');
    }
  }
);


const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    notification: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sendNotificationsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendNotificationsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.notification = action.payload;
      })
      .addCase(sendNotificationsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default notificationSlice.reducer;

