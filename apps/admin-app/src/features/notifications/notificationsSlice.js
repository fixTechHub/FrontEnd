
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sendNotifications, notificationAPI } from './notificationsAPI';

export const sendNotificationsThunk = createAsyncThunk(
  'notifications/sendNotificationsThunk',
  async (notificationData, { rejectWithValue }) => {
    try {
      const response = await sendNotifications(notificationData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to sending notifications');
    }
  }
);
export const fetchNotificationsThunk = createAsyncThunk(
    'notifications/fetchNotifications',
    async (_, { rejectWithValue }) => {
        try {
            const response = await notificationAPI.getUserNotifications();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
        }
    }
);

export const markNotificationAsReadThunk = createAsyncThunk(
    'notifications/markAsRead',
    async (notificationId, { rejectWithValue }) => {
        try {
            await notificationAPI.markAsRead(notificationId);
            return notificationId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
        }
    }
);

export const clearAllNotificationsThunk = createAsyncThunk(
    'notifications/clearAll',
    async (_, { rejectWithValue }) => {
        try {
            await notificationAPI.clearAllNotifications();
            return;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to clear notifications');
        }
    }
);

export const fetchAllNotificationsThunk = createAsyncThunk(
    'notifications/fetchAllNotifications',
    async ({ limit = 20, skip = 0 }, { rejectWithValue }) => {
        try {
            const response = await notificationAPI.getAllUserNotifications({ limit, skip });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch all notifications');
        }
    }
);

const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
      notifications: [],
      status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
      error: null,
      notification: null,
      loading: false,
    },
    reducers: {
        addNotification(state, action) {
            if (!state.notifications.some(n => n._id === action.payload._id)) {
                state.notifications.unshift(action.payload);
            }
        },
        updateNotification(state, action) {
            const updated = action.payload;
            const index = state.notifications.findIndex(n => n._id === updated._id);
            if (index !== -1) {
                state.notifications[index] = updated;
            }
        },
        clearNotifications(state) {
            state.notifications = state.notifications.filter(n => n.status !== 'DELETED');
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotificationsThunk.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.notifications = action.payload;
            })
            .addCase(fetchNotificationsThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(fetchAllNotificationsThunk.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAllNotificationsThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.notifications = action.payload;
            })
            .addCase(fetchAllNotificationsThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(clearAllNotificationsThunk.fulfilled, (state) => {
                state.notifications = [];
                state.status = 'succeeded';
            })
            .addCase(clearAllNotificationsThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(markNotificationAsReadThunk.fulfilled, (state, action) => {
                const index = state.notifications.findIndex(n => n._id === action.payload);
                if (index !== -1) {
                    state.notifications[index].isRead = true;
                }
            })
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

export const { addNotification, updateNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;