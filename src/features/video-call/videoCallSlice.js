import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Call state
  currentCall: null,
  callStatus: 'idle', // idle, ringing, connecting, connected, ended
  isIncomingCall: false,
  incomingCallData: null,
  
  // WebRTC state
  localStream: null,
  remoteStream: null,
  peerConnection: null,
  
  // Call participants
  caller: null,
  callee: null,
  
  // UI state
  isVideoEnabled: true,
  isAudioEnabled: true,
  isScreenSharing: false,
  
  // Error state
  error: null,
  loading: false
};

const videoCallSlice = createSlice({
  name: 'videoCall',
  initialState,
  reducers: {
    // Call management
    setCurrentCall: (state, action) => {
      state.currentCall = action.payload;
    },
    
    setCallStatus: (state, action) => {
      state.callStatus = action.payload;
    },
    
    setIncomingCall: (state, action) => {
      state.isIncomingCall = true;
      state.incomingCallData = action.payload;
      state.callStatus = 'ringing';
    },
    
    clearIncomingCall: (state) => {
      state.isIncomingCall = false;
      state.incomingCallData = null;
    },
    
    // WebRTC streams
    setLocalStream: (state, action) => {
      state.localStream = action.payload;
    },
    
    setRemoteStream: (state, action) => {
      state.remoteStream = action.payload;
    },
    
    setPeerConnection: (state, action) => {
      state.peerConnection = action.payload;
    },
    
    // Participants
    setCaller: (state, action) => {
      state.caller = action.payload;
    },
    
    setCallee: (state, action) => {
      state.callee = action.payload;
    },
    
    // Media controls
    toggleVideo: (state) => {
      state.isVideoEnabled = !state.isVideoEnabled;
    },
    
    toggleAudio: (state) => {
      state.isAudioEnabled = !state.isAudioEnabled;
    },
    
    toggleScreenSharing: (state) => {
      state.isScreenSharing = !state.isScreenSharing;
    },
    
    // Error handling
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    // Reset state
    resetCallState: (state) => {
      state.currentCall = null;
      state.callStatus = 'idle';
      state.isIncomingCall = false;
      state.incomingCallData = null;
      state.localStream = null;
      state.remoteStream = null;
      state.peerConnection = null;
      state.caller = null;
      state.callee = null;
      state.isVideoEnabled = true;
      state.isAudioEnabled = true;
      state.isScreenSharing = false;
      state.error = null;
      state.loading = false;
    }
  }
});

export const {
  setCurrentCall,
  setCallStatus,
  setIncomingCall,
  clearIncomingCall,
  setLocalStream,
  setRemoteStream,
  setPeerConnection,
  setCaller,
  setCallee,
  toggleVideo,
  toggleAudio,
  toggleScreenSharing,
  setError,
  clearError,
  setLoading,
  resetCallState
} = videoCallSlice.actions;

export default videoCallSlice.reducer; 