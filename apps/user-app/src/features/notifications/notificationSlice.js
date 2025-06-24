import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationAPI } from './notificationAPI';

const initialState = {
    notifications: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

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
            // The API call will trigger a websocket event.
            // We just need to ensure the call succeeds.
            await notificationAPI.markAsRead(notificationId);
            return notificationId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
        }
    }
);

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        addNotification(state, action) {
            // Add to the beginning of the list and prevent duplicates
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
            });
    },
});

export const { addNotification, updateNotification } = notificationSlice.actions;
export default notificationSlice.reducer; 