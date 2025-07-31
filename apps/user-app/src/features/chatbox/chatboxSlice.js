import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createBooking } from './chatboxAPI';

// Async thunk for sending a message to the AI chatbot
export const sendChatMessage = createAsyncThunk(
  'aiChat/sendChatMessage',
  async ({ message }, { rejectWithValue }) => {
    try {
      const response = await createBooking({ message });
      return response.data; // Assuming the API returns { reply: "response text" }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Đã xảy ra lỗi khi gửi yêu cầu.');
    }
  }
);

const aiChatSlice = createSlice({
    name: 'aiChat',
    initialState: {
      messages: [], // Store conversation history
      status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
      error: null, // Store error messages
    },
    reducers: {
      // Clear conversation history
      clearConversation(state) {
        state.messages = [];
        state.status = 'idle';
        state.error = null;
      },
      // Add a user message locally before API response
      addUserMessage(state, action) {
        state.messages.push({
          sender: 'user',
          text: action.payload,
          timestamp: Date.now(),
        });
      },
    },
    extraReducers: (builder) => {
      builder
        // Handle sendChatMessage pending
        .addCase(sendChatMessage.pending, (state) => {
          state.status = 'loading';
          state.error = null;
        })
        // Handle sendChatMessage fulfilled
        .addCase(sendChatMessage.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.messages.push({
            sender: 'bot',
            text: action.payload.reply,
            timestamp: Date.now(),
          });
        })
        // Handle sendChatMessage rejected
        .addCase(sendChatMessage.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload || 'Đã xảy ra lỗi không xác định.';
        });
    },
  });
  
  // Export actions
  export const { clearConversation, addUserMessage } = aiChatSlice.actions;
  
  // Export reducer
  export default aiChatSlice.reducer;