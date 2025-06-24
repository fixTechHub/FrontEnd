import apiClient from '../../services/apiClient';

const videoCallAPI = {
  // Initiate a video call
  initiateCall: async (callData) => {
    const response = await apiClient.post('/video-call/initiate', callData);
    return response.data;
  },

  // Accept a video call
  acceptCall: async (callData) => {
    const response = await apiClient.post('/video-call/accept', callData);
    return response.data;
  },

  // Reject a video call
  rejectCall: async (callData) => {
    const response = await apiClient.post('/video-call/reject', callData);
    return response.data;
  },

  // End a video call
  endCall: async (callData) => {
    const response = await apiClient.post('/video-call/end', callData);
    return response.data;
  },

  // Get call history for a user
  getCallHistory: async (userId) => {
    const response = await apiClient.get(`/video-call/history/${userId}`);
    return response.data;
  },

  // Get active call for a user
  getActiveCall: async (userId) => {
    const response = await apiClient.get(`/video-call/active/${userId}`);
    return response.data;
  }
};

export default videoCallAPI; 