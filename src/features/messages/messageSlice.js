import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { messageAPI } from './messageAPI';

const initialState = {
    messages: [],
    loading: false,
    error: null,
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
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMessagesThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.messages = action.payload;
            })
            .addCase(fetchMessagesThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { addMessage, clearMessagesError } = messageSlice.actions;
export default messageSlice.reducer;