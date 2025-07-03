import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { videoCallAPI } from './videoCallAPI';

export const getOnlineUsers = createAsyncThunk(
    'videoCall/getOnlineUsers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await videoCallAPI.getOnlineUsers();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const initiateCall = createAsyncThunk(
    'videoCall/initiateCall',
    async (callData, { rejectWithValue }) => {
        try {
            const response = await videoCallAPI.initiateCall(callData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const answerCall = createAsyncThunk(
    'videoCall/answerCall',
    async (answerData, { rejectWithValue }) => {
        try {
            const response = await videoCallAPI.answerCall(answerData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const endCall = createAsyncThunk(
    'videoCall/endCall',
    async (endData, { rejectWithValue }) => {
        try {
            const response = await videoCallAPI.endCall(endData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const declineCall = createAsyncThunk(
    'videoCall/declineCall',
    async (declineData, { rejectWithValue }) => {
        try {
            const response = await videoCallAPI.declineCall(declineData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const getCallHistory = createAsyncThunk(
    'videoCall/getCallHistory',
    async (bookingId, { rejectWithValue }) => {
        try {
            const response = await videoCallAPI.getCallHistory(bookingId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const videoCallSlice = createSlice({
    name: 'videoCall',
    initialState: {
      onlineUsers: [],
      callHistory: [],
      status: 'idle',
      error: null,
      call: { isReceivingCall: false, from: null, name: null, signal: null }, // Structured initial state
      callAccepted: false,
      callEnded: false,
      currentSessionId: null,
    },
    reducers: {
      setCall: (state, action) => {
        state.call = { ...state.call, ...action.payload }; // Merge payload with existing call state
      },
      setCallAccepted: (state, action) => {
        state.callAccepted = action.payload;
      },
      setCallEnded: (state, action) => {
        state.callEnded = action.payload;
      },
      setCurrentSessionId: (state, action) => {
        state.currentSessionId = action.payload;
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(getOnlineUsers.pending, (state) => {
          state.status = 'loading';
        })
        .addCase(getOnlineUsers.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.onlineUsers = action.payload;
        })
        .addCase(getOnlineUsers.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        })
        .addCase(initiateCall.fulfilled, (state, action) => {
          state.currentSessionId = action.payload.sessionId;
        })
        .addCase(answerCall.fulfilled, (state, action) => {
          // Handle successful call answer
        })
        .addCase(endCall.fulfilled, (state, action) => {
          // Handle successful call end
        })
        .addCase(declineCall.fulfilled, (state, action) => {
          // Handle successful call decline
        })
        .addCase(getCallHistory.pending, (state) => {
          state.status = 'loading';
        })
        .addCase(getCallHistory.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.callHistory = action.payload;
        })
        .addCase(getCallHistory.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        });
    },
  });

export const { setCall, setCallAccepted, setCallEnded, setCurrentSessionId } = videoCallSlice.actions;

export default videoCallSlice.reducer; 