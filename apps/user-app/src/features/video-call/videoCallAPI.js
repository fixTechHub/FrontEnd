import apiClient from '../../services/apiClient';
 
export const videoCallAPI = {
    getOnlineUsers: () => {
        return apiClient.get('/video-call/online-users');
    },
    getVideoCallStatus: (sessionId) => {
        return apiClient.get(`/video-call/status/${sessionId}`);
    },
    updateVideoCallStatus: (sessionId, status) => {
        return apiClient.patch(`/video-call/status/${sessionId}`, { status });
    },
    initiateCall: (callData) => {
        return apiClient.post('/video-call/initiate', callData);
    },
    answerCall: (answerData) => {
        return apiClient.post('/video-call/answer', answerData);
    },
    endCall: (endData) => {
        return apiClient.post('/video-call/end', endData);
    },
    declineCall: (declineData) => {
        return apiClient.post('/video-call/decline', declineData);
    },
    getCallHistory: (bookingId) => {
        return apiClient.get(`/video-call/history/${bookingId}`);
    }
}; 