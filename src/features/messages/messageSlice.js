import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { messageAPI } from './messageAPI';

const initialState = {
    messages: [],
    loading: 'idle', // 'idle' | 'pending' | 'succeeded' | 'failed'
    error: null,
    sending: 'idle',
};

export const fetchMessagesThunk = createAsyncThunk(
    'messages/fetchMessages',
    async (bookingId, { rejectWithValue }) => {
        try {
            const response = await messageAPI.getMessagesByBookingId(bookingId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch messages');
        }
    }
);

export const sendMessageThunk = createAsyncThunk(
    'messages/sendMessage',
    async (messageData, { rejectWithValue }) => {
        try {
            const response = await messageAPI.sendMessage(messageData);
            return response.data; // The backend should return the saved message
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to send message');
        }
    }
);

const messageSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        addMessage(state, action) {
            const newMessage = action.payload;
            // Prevent duplicates by checking _id
            if (!state.messages.some((msg) => msg._id === newMessage._id)) {
                state.messages.push(newMessage);
            }
        },
        clearMessagesError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMessagesThunk.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(fetchMessagesThunk.fulfilled, (state, action) => {
                state.loading = 'succeeded';
                state.messages = action.payload;
            })
            .addCase(fetchMessagesThunk.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload;
            })
            // Handle sending state
            .addCase(sendMessageThunk.pending, (state) => {
                state.sending = 'pending';
            })
            .addCase(sendMessageThunk.fulfilled, (state, action) => {
                state.sending = 'succeeded';
                // The new message is added via websocket, so we don't need to push it here.
                // This prevents duplicates.
            })
            .addCase(sendMessageThunk.rejected, (state, action) => {
                state.sending = 'failed';
                state.error = action.payload; // You might want a specific sendError state
            });
    },
});

export const { addMessage, clearMessagesError } = messageSlice.actions;
export default messageSlice.reducer;