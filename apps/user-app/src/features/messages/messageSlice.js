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
    async ({ bookingId, bookingWarrantyId }, { rejectWithValue }) => {
        try {
            const response = await messageAPI.getMessagesByBookingOrWarrantyId(bookingId, bookingWarrantyId);
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
            console.log('--- REDUCER: addMessage ---', action.payload);
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
                // The new message is returned from the API.
                // We add it to the state here for an immediate UI update for the sender.
                // The websocket listener will update the other user's UI.
                // The duplicate check in the 'addMessage' reducer will prevent a double-add
                // if the sender also gets the websocket event.
                const newMessage = action.payload;
                if (!state.messages.some((msg) => msg._id === newMessage._id)) {
                    state.messages.push(newMessage);
                }
            })
            .addCase(sendMessageThunk.rejected, (state, action) => {
                state.sending = 'failed';
                state.error = action.payload; // You might want a specific sendError state
            });
    },
});

export const { addMessage, clearMessagesError } = messageSlice.actions;
export default messageSlice.reducer;