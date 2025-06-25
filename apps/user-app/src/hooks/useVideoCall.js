import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setCurrentCall,
  setCallStatus,
  setIncomingCall,
  clearIncomingCall,
  setLocalStream,
  setRemoteStream,
  setPeerConnection,
  setError,
  resetCallState
} from '../features/video-call/videoCallSlice';
import {
  onIncomingCall,
  onCallAccepted,
  onCallRejected,
  onCallEnded,
  onOffer,
  onAnswer,
  onIceCandidate,
  joinCallRoom,
  leaveCallRoom,
  sendOffer,
  sendAnswer,
  sendIceCandidate
} from '../services/socket';
import videoCallAPI from '../features/video-call/videoCallAPI';

const useVideoCall = () => {
  const dispatch = useDispatch();
  const {
    currentCall,
    callStatus,
    isIncomingCall,
    incomingCallData,
    localStream,
    remoteStream,
    peerConnection,
    caller,
    callee,
    isVideoEnabled,
    isAudioEnabled,
    error
  } = useSelector((state) => state.videoCall);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const currentCallRef = useRef(currentCall);

  useEffect(() => {
    currentCallRef.current = currentCall;
  }, [currentCall]);

  // WebRTC Configuration
  const rtcConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Initialize local media stream
  const initializeLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      dispatch(setLocalStream(stream));
      localStreamRef.current = stream;
      
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      dispatch(setError('Failed to access camera and microphone'));
      throw error;
    }
  }, [dispatch]);

  // Create peer connection
  const createPeerConnection = useCallback(() => {
    try {
      const pc = new RTCPeerConnection(rtcConfiguration);
      
      // Add local stream to peer connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && currentCallRef.current) {
          const targetUserId = currentCallRef.current.callerId === caller?._id ? currentCallRef.current.calleeId : currentCallRef.current.callerId;
          sendIceCandidate(currentCallRef.current.callId, event.candidate, targetUserId);
        }
      };

      // Handle remote stream
      pc.ontrack = (event) => {
        dispatch(setRemoteStream(event.streams[0]));
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('Connection state:', pc.connectionState);
        if (pc.connectionState === 'connected') {
          dispatch(setCallStatus('connected'));
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          dispatch(setCallStatus('ended'));
        }
      };

      dispatch(setPeerConnection(pc));
      peerConnectionRef.current = pc;
      
      return pc;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      dispatch(setError('Failed to create peer connection'));
      throw error;
    }
  }, [dispatch, caller]);

  // Initiate call
  const initiateCall = useCallback(async (callerData, calleeId, calleeName, bookingId) => {
    try {
      // Pre-emptively create peer connection for the caller
      await initializeLocalStream();
      createPeerConnection();

      dispatch(setCallStatus('ringing'));
      const response = await videoCallAPI.initiateCall({
        callerId: callerData._id,
        callerName: callerData.name,
        calleeId,
        calleeName,
        bookingId
      });

      if (response.success) {
        dispatch(setCurrentCall({
          callId: response.callId,
          callerId: callerData._id,
          callerName: callerData.name,
          calleeId,
          calleeName,
          bookingId,
          status: 'ringing'
        }));
        joinCallRoom(response.callId);
      } else {
        throw new Error(response.message || 'Failed to initiate call on server');
      }
    } catch (error) {
      console.error('Error initiating call:', error);
      dispatch(setError(error.message || 'Failed to initiate call'));
      dispatch(resetCallState());
    }
  }, [dispatch, initializeLocalStream, createPeerConnection]);

  // Accept call
  const acceptCall = useCallback(async () => {
    if (!incomingCallData) return;
    try {
      await initializeLocalStream();
      createPeerConnection();
      
      joinCallRoom(incomingCallData.callId);

      dispatch(setCurrentCall({
        callId: incomingCallData.callId,
        callerId: incomingCallData.callerId,
        callerName: incomingCallData.callerName,
        calleeId: incomingCallData.calleeId,
        calleeName: caller?.name,
        bookingId: incomingCallData.bookingId,
        status: 'connecting'
      }));

      await videoCallAPI.acceptCall({
        callId: incomingCallData.callId,
        calleeId: incomingCallData.calleeId
      });
      
      dispatch(clearIncomingCall());
    } catch (error) {
      console.error('Error accepting call:', error);
      dispatch(setError('Failed to accept call'));
      dispatch(resetCallState());
    }
  }, [dispatch, incomingCallData, initializeLocalStream, createPeerConnection, caller]);

  // Reject call
  const rejectCall = useCallback(async (reason = 'Call rejected') => {
    if (!incomingCallData) return;
    try {
      await videoCallAPI.rejectCall({
        callId: incomingCallData.callId,
        calleeId: incomingCallData.calleeId,
        reason
      });
      dispatch(clearIncomingCall());
      dispatch(setCallStatus('idle'));
    } catch (error) {
      console.error('Error rejecting call:', error);
      dispatch(setError('Failed to reject call'));
    }
  }, [dispatch, incomingCallData]);

  // End call
  const endCall = useCallback(async () => {
    if (!currentCallRef.current || !caller?._id) return;
    try {
      await videoCallAPI.endCall({
        callId: currentCallRef.current.callId,
        userId: caller._id
      });
      leaveCallRoom(currentCallRef.current.callId);
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      dispatch(resetCallState());
    } catch (error) {
      console.error('Error ending call:', error);
      dispatch(setError('Failed to end call'));
    }
  }, [dispatch, caller]);

  // Handle incoming call
  const handleIncomingCall = useCallback((callData) => {
    dispatch(setIncomingCall(callData));
  }, [dispatch]);

  useEffect(() => {
    const cleanup = onIncomingCall(handleIncomingCall);
    return cleanup;
  }, [handleIncomingCall]);

  // Handle call accepted
  const handleCallAccepted = useCallback(async (data) => {
    if (data.callId !== currentCallRef.current?.callId) return;
    try {
      dispatch(setCallStatus('connecting'));
      const pc = peerConnectionRef.current;
      if (!pc) {
        throw new Error("Peer connection not initialized for caller.");
      }
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      if (currentCallRef.current) {
        sendOffer(currentCallRef.current.callId, offer, currentCallRef.current.calleeId);
      }
    } catch (err) {
      console.error("Error creating offer on call accepted:", err);
      dispatch(setError("Failed to create video offer."));
    }
  }, [dispatch]);

  useEffect(() => {
    const cleanup = onCallAccepted(handleCallAccepted);
    return cleanup;
  }, [handleCallAccepted]);

  // Handle call rejected
  const handleCallRejected = useCallback((data) => {
    if (data.callId === currentCallRef.current?.callId) {
      dispatch(setError('Call was rejected'));
      dispatch(resetCallState());
    }
  }, [dispatch]);

  useEffect(() => {
    const cleanup = onCallRejected(handleCallRejected);
    return cleanup;
  }, [handleCallRejected]);

  // Handle call ended
  const handleCallEnded = useCallback((data) => {
    if (data.callId === currentCallRef.current?.callId) {
      dispatch(setCallStatus('ended'));
      setTimeout(() => {
        dispatch(resetCallState());
      }, 2000);
    }
  }, [dispatch]);

  useEffect(() => {
    const cleanup = onCallEnded(handleCallEnded);
    return cleanup;
  }, [handleCallEnded]);

  // Handle WebRTC offer
  const handleOffer = useCallback(async (data) => {
    if (data.callId !== currentCallRef.current?.callId) return;
    try {
      await initializeLocalStream();
      const pc = createPeerConnection();
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      if (currentCallRef.current) {
        sendAnswer(currentCallRef.current.callId, answer, currentCallRef.current.callerId);
      }
    } catch (error) {
      console.error('Error handling offer:', error);
      dispatch(setError('Failed to establish connection on offer.'));
    }
  }, [dispatch, initializeLocalStream, createPeerConnection]);

  useEffect(() => {
    const cleanup = onOffer(handleOffer);
    return cleanup;
  }, [handleOffer]);

  // Handle WebRTC answer
  const handleAnswer = useCallback(async (data) => {
    if (data.callId === currentCallRef.current?.callId && peerConnectionRef.current) {
      if (peerConnectionRef.current.signalingState === 'stable') {
         console.warn('Received answer in stable state, ignoring.');
         return;
      }
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
    }
  }, []);

  useEffect(() => {
    const cleanup = onAnswer(handleAnswer);
    return cleanup;
  }, [handleAnswer]);

  // Handle ICE candidates
  const handleIceCandidate = useCallback(async (data) => {
    if (data.callId === currentCallRef.current?.callId && peerConnectionRef.current) {
      await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  }, []);

  useEffect(() => {
    const cleanup = onIceCandidate(handleIceCandidate);
    return cleanup;
  }, [handleIceCandidate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    // State
    currentCall,
    callStatus,
    isIncomingCall,
    incomingCallData,
    localStream,
    remoteStream,
    caller,
    callee,
    isVideoEnabled,
    isAudioEnabled,
    error,
    
    // Actions
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    initializeLocalStream,
    createPeerConnection
  };
};

export default useVideoCall; 