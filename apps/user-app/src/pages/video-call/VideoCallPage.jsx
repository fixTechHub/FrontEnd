import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Peer from 'simple-peer';
import { setCall, setCallAccepted, setCallEnded, setCurrentSessionId, initiateCall, answerCall, endCall, declineCall } from '../../features/video-call/videoCallSlice';
import { fetchBookingById } from '../../features/bookings/bookingSlice';
import { getSocket } from '../../services/socket';
import './VideoCallPage.css';
import { MdCallEnd } from 'react-icons/md';
import { toast } from 'react-toastify';
import '../../utils/polyfills';

// STUN/TURN Configuration for production
const getIceConfiguration = () => {
  const isProduction = window.location.protocol === 'https:';
  return isProduction
    ? {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
          { urls: 'stun:stun.stunprotocol.org:3478' },
          { urls: 'stun:stun.voiparound.com' },
          { urls: 'stun:stun.voipbuster.com' },
          { urls: 'stun:stun.relay.metered.ca:80' },
          {
            urls: 'turn:global.relay.metered.ca:80',
            username: '8b25f915de9f9386eb3c55db',
            credential: 'jRSPzXpVBFHrSQQN',
          },
          {
            urls: 'turn:global.relay.metered.ca:80?transport=tcp',
            username: '8b25f915de9f9386eb3c55db',
            credential: 'jRSPzXpVBFHrSQQN',
          },
          {
            urls: 'turn:global.relay.metered.ca:443',
            username: '8b25f915de9f9386eb3c55db',
            credential: 'jRSPzXpVBFHrSQQN',
          },
          {
            urls: 'turns:global.relay.metered.ca:443?transport=tcp',
            username: '8b25f915de9f9386eb3c55db',
            credential: 'jRSPzXpVBFHrSQQN',
          },
        ],
        iceCandidatePoolSize: 10,
      }
    : { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
};

// Enhanced media constraints
const getMediaConstraints = () => ({
  video: {
    width: { min: 320, ideal: 640, max: 1280 },
    height: { min: 240, ideal: 480, max: 720 },
    frameRate: { min: 15, ideal: 24, max: 30 },
    facingMode: 'user',
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 44100,
  },
});

const VideoCallPage = () => {
  const dispatch = useDispatch();
  const { bookingId } = useParams();
  const location = useLocation();
  const { booking } = useSelector((state) => state.booking);
  const { call, callAccepted, callEnded, currentSessionId } = useSelector((state) => state.videoCall);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const hasCalled = useRef(false);
  const hasStopped = useRef(false);
  const bookingWarrantyId = location.state?.bookingWarrantyId;

  const [stream, setStream] = useState(null);
  const [connectionState, setConnectionState] = useState('new');
  const [isConnecting, setIsConnecting] = useState(false);
  const [iceFailureTimeout, setIceFailureTimeout] = useState(null);
  const [isStreamReady, setIsStreamReady] = useState(false);

  const logIceCandidate = (candidate, type) => {
    console.log(`${type} ICE Candidate:`, {
      candidate: candidate.candidate,
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex,
    });
  };

  useEffect(() => {
    if (!location.state?.fromMessageBox) {
      console.warn('Direct access to VideoCallPage detected, redirecting...');
      toast.warn('Unauthorized access: Please start the video call from the message box.', {
        position: 'top-right',
        autoClose: 5000,
      });
      navigate(-1, { replace: true });
      return;
    }

    dispatch(fetchBookingById(bookingId));

    if (booking && user) {
      const isCustomer = booking.customerId?._id === user._id;
      const isTechnician = booking.technicianId?.userId?._id === user._id;
      if (!isCustomer && !isTechnician) {
        console.warn('User not part of booking, redirecting...');
        toast.warn('Access denied: You are not a participant in this booking.', {
          position: 'top-right',
          autoClose: 5000,
        });
        navigate(-1, { replace: true });
      }
    }
  }, [dispatch, bookingId, navigate, booking, user, bookingWarrantyId, location.state]);

  const stopStream = (reason = 'unknown') => {
    if (stream && !hasStopped.current) {
      hasStopped.current = true;
      console.log(`Stopping stream for user: ${user._id}, Reason: ${reason}`);
      stream.getTracks().forEach((track, index) => {
        console.log(`Stopping track ${index}: ${track.kind}, active: ${track.readyState === 'live'}`);
        track.stop();
      });
      if (myVideo.current) {
        myVideo.current.srcObject = null;
        myVideo.current.load();
        console.log('Cleared myVideo srcObject');
      }
      if (userVideo.current) {
        userVideo.current.srcObject = null;
        userVideo.current.load();
        console.log('Cleared userVideo srcObject');
      }
      setStream(null);
      setIsStreamReady(false);
      console.log(`Stream stopped for user: ${user._id} (Reason: ${reason})`);
    }
  };

  const initializeStream = async (attempt = 0) => {
    const maxRetries = 3;
    if (attempt >= maxRetries) {
      console.error(`Max retries (${maxRetries}) reached for media access`);
      toast.error('Could not access camera/microphone. Please check permissions or device availability.');
      return;
    }

    try {
      console.log(`Attempting to initialize stream, attempt: ${attempt + 1}`);
      const constraints = getMediaConstraints();
      const currentStream = await navigator.mediaDevices.getUserMedia(constraints);
      const videoTracks = currentStream.getVideoTracks();
      console.log(`Stream initialized with ${videoTracks.length} video tracks`);
      if (videoTracks.length === 0) {
        throw new Error('No video track available');
      }
      setStream(currentStream);
      setIsStreamReady(true);
      console.log('Stream initialized successfully');
      hasStopped.current = false;
    } catch (error) {
      console.error(`Error accessing media devices, attempt ${attempt + 1}:`, error);
      if (error.name === 'NotAllowedError') {
        toast.error('Camera/microphone access denied. Please allow permissions in browser settings.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No camera/microphone found. Please connect a device.');
      } else if (error.name === 'NotReadableError') {
        toast.error('Camera/microphone is being used by another application.');
      } else {
        toast.error('Failed to access camera/microphone. Check device or permissions.');
      }
      if (attempt < maxRetries - 1) {
        setTimeout(() => initializeStream(attempt + 1), 1000);
      }
    }
  };

  useEffect(() => {
    if (myVideo.current && stream && !hasStopped.current) {
      console.log('Attaching stream to myVideo');
      myVideo.current.srcObject = stream;
      myVideo.current.play().catch((error) => {
        console.warn('Local video autoplay failed:', error);
        toast.warn('Local video failed to play. Please click "Start Camera" to enable it.');
      });
    }
  }, [stream, myVideo, hasStopped]);

  const createPeer = (initiator, stream) => {
    const iceConfig = getIceConfiguration();
    console.log('Creating peer with ICE configuration:', iceConfig);
    const peer = new Peer({
      initiator,
      trickle: false,
      stream,
      config: iceConfig,
      offerOptions: { offerToReceiveAudio: true, offerToReceiveVideo: true },
    });

    peer.on('connect', () => {
      console.log('✅ Peer connected successfully');
      setConnectionState('connected');
      setIsConnecting(false);
      toast.success('Connected successfully!', { autoClose: 2000 });
    });

    peer.on('close', () => {
      console.log('🔌 Peer connection closed');
      setConnectionState('closed');
      setIsConnecting(false);
      if (callEnded) {
        stopStream('peer closed');
      }
    });

    peer.on('error', (err) => {
      console.error('❌ Peer error:', err);
      setConnectionState('failed');
      setIsConnecting(false);
      if (callEnded) {
        stopStream('peer error');
      }
    });

    if (peer._pc) {
      peer._pc.addEventListener('iceconnectionstatechange', () => {
        const state = peer._pc.iceConnectionState;
        console.log('🧊 ICE connection state:', state);
        setConnectionState(state);
        if (state === 'connected' || state === 'completed') {
          setIsConnecting(false);
          toast.success('Connection established!', { autoClose: 2000 });
        } else if (state === 'failed') {
          const timeout = setTimeout(() => {
            if (!callAccepted && !callEnded) {
              setIsConnecting(false);
              toast.error('Connection failed. Retrying...');
              if (initiator && stream && !hasCalled.current) {
                callUser(user._id === booking?.customerId?._id ? booking?.technicianId?.userId?._id : booking?.customerId?._id);
              }
            }
          }, 5000);
          setIceFailureTimeout(timeout);
        } else if (state === 'disconnected') {
          setIsConnecting(false);
          toast.warn('Disconnected. Attempting to reconnect...');
        } else if (state === 'connecting') {
          setIsConnecting(true);
        }
      });

      peer._pc.addEventListener('icecandidate', (event) => {
        if (event.candidate) {
          logIceCandidate(event.candidate, 'Local');
        }
      });
    }

    return peer;
  };

  useEffect(() => {
    const socket = getSocket();
    if (!socket) {
      console.error('Socket not available');
      return;
    }

    initializeStream();

    const handleCallUser = (data) => {
      console.log('Received callUser event:', data);
      const { from, name, signal, sessionId, bookingId: incomingBookingId, warrantyId: incomingWarrantyId } = data;
      const isValidCall = (incomingBookingId && incomingBookingId === bookingId) || (incomingWarrantyId && incomingWarrantyId === bookingWarrantyId);
      if (isValidCall && !callAccepted && !hasCalled.current && isStreamReady && user) {
        hasCalled.current = true;
        dispatch(setCurrentSessionId(data.sessionId));
        dispatch(setCall({ ...data, isReceivingCall: true }));
        console.log('Incoming call from:', data.from, 'with sessionId:', data.sessionId);
        answerIncomingCall(data);
      } else if (!isStreamReady) {
        console.warn('Stream not ready for incoming call, reinitializing...');
        initializeStream();
      }
    };

    const handleCallEnded = () => {
      console.log('Received callEnded event');
      if (!callEnded) {
        dispatch(setCallEnded(true));
        if (connectionRef.current) {
          connectionRef.current.destroy();
          connectionRef.current = null;
        }
        stopStream('call ended');
        hasCalled.current = false;
        const redirectPath = bookingWarrantyId ? `/warranty?bookingWarrantyId=${bookingWarrantyId}` : `/booking/booking-processing?bookingId=${bookingId}`;
        navigate(redirectPath, { replace: true });
        window.location.reload();
      }
    };

    const handleCallDeclined = (data) => {
      console.log(`Call declined by user ${data.from}`);
      if (connectionRef.current) {
        connectionRef.current.destroy();
        connectionRef.current = null;
      }
      stopStream('call declined');
      dispatch(setCallEnded(true));
      hasCalled.current = false;
      socket.emit('callDeclined', { to: data.from, from: user._id, sessionId: currentSessionId });
      toast.info(`Call declined by ${data.from}`, { position: 'top-right', autoClose: 3000 });
      const redirectPath = bookingWarrantyId ? `/warranty?bookingWarrantyId=${bookingWarrantyId}` : `/booking/booking-processing?bookingId=${bookingId}`;
      navigate(redirectPath, { replace: true });
      window.location.reload();
    };

    socket.on('callUser', handleCallUser);
    socket.on('callEnded', handleCallEnded);
    socket.on('callDeclined', handleCallDeclined);

    return () => {
      console.log('Cleaning up VideoCallPage');
      socket.off('callUser', handleCallUser);
      socket.off('callEnded', handleCallEnded);
      socket.off('callDeclined', handleCallDeclined);
      if (iceFailureTimeout) clearTimeout(iceFailureTimeout);
      if (callAccepted && !callEnded && connectionRef.current) {
        console.log('Call active during cleanup - ending call');
        connectionRef.current.destroy();
        connectionRef.current = null;
        stopStream('navigation away from call');
        const otherUserId = call.from || (booking && (user._id === booking.customerId._id ? booking.technicianId.userId._id : booking.customerId._id));
        if (socket && currentSessionId && otherUserId) {
          dispatch(endCall({ sessionId: currentSessionId, to: otherUserId }))
            .then(() => console.log('Call ended successfully via API'))
            .catch((error) => {
              console.error('Failed to end call via API:', error);
              socket.emit('endCall', { to: otherUserId, sessionId: currentSessionId, from: user._id });
            });
          dispatch(setCallEnded(true));
        }
      } else if (call.isReceivingCall && !callAccepted) {
        console.log('Declining incoming call due to navigation');
        const otherUserId = call.from;
        if (socket && otherUserId && currentSessionId) {
          dispatch(declineCall({ sessionId: currentSessionId, to: otherUserId }))
            .catch((error) => {
              console.error('Failed to decline call via API:', error);
              socket.emit('callDeclined', { to: otherUserId, from: user._id, sessionId: currentSessionId });
            });
        }
      }
      stopStream('component unmount');
      hasCalled.current = false;
    };
  }, [dispatch, bookingId, navigate, callEnded, iceFailureTimeout]);

  useEffect(() => {
    if (isStreamReady && user && !hasCalled.current && !call.isReceivingCall && !callAccepted && !location.state?.answerCall) {
      const otherUserId = user._id === booking?.customerId?._id ? booking?.technicianId?.userId?._id : booking?.customerId?._id;
      if (otherUserId) {
        console.log(`Initiating call to user: ${otherUserId}`);
        hasCalled.current = true;
        setIsConnecting(true);
        callUser(otherUserId);
      }
    }
  }, [isStreamReady, user, call.isReceivingCall, callAccepted, location.state, booking]);

  useEffect(() => {
    if (isStreamReady && user && !hasCalled.current && location.state?.answerCall && location.state?.incomingCall && !callAccepted) {
      console.log('Answering incoming call from:', location.state.incomingCall.from);
      hasCalled.current = true;
      setIsConnecting(true);
      answerIncomingCall(location.state.incomingCall);
    }
  }, [isStreamReady, user, location.state, callAccepted, booking]);

  const callUser = (id) => {
    const socket = getSocket();
    if (!socket || !stream) {
      console.log('Cannot call user, stream or socket unavailable');
      toast.error('Cannot initiate call. Please refresh and try again.');
      return;
    }
    console.log('Setting up call to user:', id);
    dispatch(setCall({ isReceivingCall: false, from: user._id, name: user.fullName, signal: null }));
    const peer = createPeer(true, stream);
    peer.on('signal', async (data) => {
      console.log('Sending call signal to:', id);
      try {
        const result = await dispatch(
          initiateCall({
            bookingId,
            to: id,
            signalData: data,
            name: user.fullName,
            warrantyId: bookingWarrantyId || null,
          })
        ).unwrap();
        socket.emit('callUser', {
          userToCall: id,
          signalData: data,
          from: user._id,
          name: user.fullName,
          bookingId: bookingWarrantyId ? null : bookingId,
          warrantyId: bookingWarrantyId || null,
        });
        console.log('Call initiated successfully with sessionId:', result.sessionId);
      } catch (error) {
        console.error('Failed to initiate call:', error);
        toast.error('Failed to initiate call. Please try again.');
        setIsConnecting(false);
        socket.emit('callFailed', { message: 'Failed to initiate call.' });
      }
    });
    peer.on('stream', (currentStream) => {
      console.log('Received remote stream');
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
        userVideo.current.play().catch((error) => console.warn('Remote video autoplay failed:', error));
      }
    });
    socket.on('callAccepted', (signal) => {
      console.log('Call accepted, receiving signal');
      const receiverName = user._id === booking?.customerId?._id ? booking?.technicianId?.userId?.fullName : booking?.customerId?.fullName;
      dispatch(setCall({ ...call, name: receiverName }));
      dispatch(setCallAccepted(true));
      setIsConnecting(false);
      peer.signal(signal);
    });
    connectionRef.current = peer;
    return () => {
      socket.off('callAccepted');
    };
  };

  const answerIncomingCall = (incomingCallData) => {
    const socket = getSocket();
    if (!socket || !stream) {
      console.log('Cannot answer call, stream or socket unavailable');
      toast.error('Cannot answer call. Please refresh and try again.');
      return;
    }
    console.log('Answering call from:', incomingCallData.from);
    dispatch(setCall({ isReceivingCall: false, from: incomingCallData.from, name: incomingCallData.name, signal: incomingCallData.signal }));
    dispatch(setCallAccepted(true));
    const peer = createPeer(false, stream);
    peer.on('signal', async (data) => {
      console.log('Sending answer signal to:', incomingCallData.from);
      try {
        await dispatch(answerCall({ sessionId: currentSessionId, signal: data, to: incomingCallData.from })).unwrap();
        console.log('Call answered successfully');
        setIsConnecting(false);
      } catch (error) {
        console.error('Failed to answer call:', error);
        toast.error('Failed to answer call. Please try again.');
        setIsConnecting(false);
      }
    });
    peer.on('stream', (currentStream) => {
      console.log('Received remote stream');
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
        userVideo.current.play().catch((error) => console.warn('Remote video autoplay failed:', error));
      }
    });
    peer.signal(incomingCallData.signal);
    connectionRef.current = peer;
  };

  const leaveCall = async () => {
    const socket = getSocket();
    if (!socket) return;
    console.log('Leaving call, notifying other user:', call.from);
    dispatch(setCallEnded(true));
    const otherUserId = call.from || (booking && (user._id === booking.customerId._id ? booking.technicianId.userId._id : booking.customerId._id));
    if (otherUserId && currentSessionId) {
      try {
        await dispatch(endCall({ sessionId: currentSessionId, to: otherUserId })).unwrap();
        socket.emit('callEnded', { to: otherUserId, sessionId: currentSessionId });
        console.log('Call ended successfully');
      } catch (error) {
        console.error('Failed to end call:', error);
        socket.emit('endCall', { to: otherUserId, sessionId: currentSessionId });
      }
    }
    if (connectionRef.current) {
      connectionRef.current.destroy();
      connectionRef.current = null;
    }
    stopStream('manual hang up');
    const redirectPath = bookingWarrantyId ? `/warranty?bookingWarrantyId=${bookingWarrantyId}` : `/booking/booking-processing?bookingId=${bookingId}`;
    navigate(redirectPath, { replace: true });
    window.location.reload();
  };

  useEffect(() => {
    const handlePopState = (event) => {
      if (callAccepted && !callEnded) {
        leaveCall();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      if (callAccepted && !callEnded) {
        leaveCall();
      }
      window.removeEventListener('popstate', handlePopState);
    };
  }, [callAccepted, callEnded]);

  const getConnectionStatusText = () => {
    if (isConnecting) return 'Đang kết nối...';
    if (connectionState === 'connected' || connectionState === 'completed') return 'Đã kết nối';
    if (connectionState === 'failed') return 'Kết nối thất bại';
    if (connectionState === 'disconnected') return 'Mất kết nối';
    if (callAccepted && !callEnded) return 'Trong cuộc gọi';
    return 'Đang đợi chấp nhận...';
  };

  const getConnectionStatusClass = () => {
    if (connectionState === 'connected' || connectionState === 'completed') return 'connected';
    if (connectionState === 'failed') return 'failed';
    if (connectionState === 'disconnected') return 'disconnected';
    return 'waiting';
  };

  const handleStartCamera = () => {
    if (myVideo.current && stream && !myVideo.current.paused) {
      console.log('Camera already playing');
      return;
    }
    if (myVideo.current && stream) {
      myVideo.current.play().catch((error) => {
        console.error('Manual play failed:', error);
        toast.error('Failed to start camera. Check permissions or browser settings.');
      });
    }
  };

  return (
    <div className="custom-video-call-container">
      <div className="custom-video-container">
        <div className="custom-video-wrapper remote">
          <span className="custom-video-label">{call.name || 'Remote User'}</span>
          {callAccepted && !callEnded ? (
            <video className="custom-video" playsInline ref={userVideo} autoPlay />
          ) : (
            <div className={`custom-waiting-message ${getConnectionStatusClass()}`}>
              {getConnectionStatusText()}
              {isConnecting && <div className="loading-spinner"></div>}
            </div>
          )}
        </div>
        <div className="custom-video-wrapper local">
          <span className="custom-video-label">Bạn</span>
          {stream && !hasStopped.current ? (
            <video className="custom-video" playsInline muted ref={myVideo} />
          ) : (
            <div className="custom-waiting-message">Đang khởi tạo camera...</div>
          )}
        </div>
      </div>
      {true && (
        <div
          style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 1000,
          }}
        >
          <div>Connection State: {connectionState}</div>
          <div>Is Connecting: {isConnecting ? 'Yes' : 'No'}</div>
          <div>Call Accepted: {callAccepted ? 'Yes' : 'No'}</div>
          <div>Stream: {stream ? 'Available' : 'Not Available'}</div>
          <div>Stream Stopped: {hasStopped.current ? 'Yes' : 'No'}</div>
          <div>Is Stream Ready: {isStreamReady ? 'Yes' : 'No'}</div>
          <div>User: {user ? 'Available' : 'Not Available'}</div>
          <div>myVideo Paused: {myVideo.current && myVideo.current.paused ? 'Yes' : 'No'}</div>
        </div>
      )}
      <div className="custom-controls">
        <button className="custom-btn-hangup" onClick={leaveCall}>
          <MdCallEnd size={24} color="white" />
        </button>
        {/* <button 
        className="custom-btn-camera"
         onClick={handleStartCamera}>
          📷
        </button> */}
      </div>
    </div>
  );
};

export default VideoCallPage;