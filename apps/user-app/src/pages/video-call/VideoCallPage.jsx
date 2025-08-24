import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Peer from 'simple-peer';
import { setCall, setCallAccepted, setCallEnded, setCurrentSessionId, initiateCall, answerCall, endCall, declineCall } from '../../features/video-call/videoCallSlice';
import { fetchBookingById } from '../../features/bookings/bookingSlice';
import { getSocket } from '../../services/socket';
import './VideoCallPage.css'
import { MdCallEnd } from 'react-icons/md';
import { toast } from 'react-toastify';

// Polyfill for process.nextTick if needed
if (typeof process === 'undefined') {
  window.process = { nextTick: (fn) => setTimeout(fn, 0) };
}

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
  const isInitiator = useRef(false); // Track who initiates the call

  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const hasStopped = useRef(false);
  const bookingWarrantyId = location.state?.bookingWarrantyId;

  useEffect(() => {
    // Redirect if not navigated from MessageBox
    if (!location.state?.fromMessageBox) {
      console.warn('Direct access to VideoCallPage detected, redirecting...');
      toast.warn('Unauthorized access: Please start the video call from the message box.', {
        position: 'top-right',
        autoClose: 5000,
      });
      navigate(-1, { replace: true });
      return;
    }

    // Fetch booking details to verify user participation
    dispatch(fetchBookingById(bookingId));

    // Verify user is part of the booking
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
        myVideo.current.pause();
        myVideo.current.srcObject = null;
      }
      setStream(null);
      console.log(`Stream stopped for user: ${user._id} (Reason: ${reason})`);
    }
  };

  const initializeStream = async () => {
    try {
      console.log('Initializing media stream...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      console.log('Media stream obtained successfully');
      setStream(mediaStream);
      
      if (myVideo.current) {
        myVideo.current.srcObject = mediaStream;
      }
      
      return mediaStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Cannot access camera/microphone. Please check permissions.');
      return null;
    }
  };

  // Initialize stream on component mount
  useEffect(() => {
    let mounted = true;
    
    const setupStream = async () => {
      if (mounted && !stream) {
        await initializeStream();
      }
    };
    
    setupStream();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Socket event handlers
  useEffect(() => {
    const socket = getSocket();
    if (!socket) {
      console.error('Socket not available');
      return;
    }

    const handleCallUser = (data) => {
      console.log('Received callUser event:', data);
      const { from, name, signal, sessionId, bookingId: incomingBookingId, warrantyId: incomingWarrantyId } = data;
      
      const isValidCall = (incomingBookingId && incomingBookingId === bookingId) ||
        (incomingWarrantyId && incomingWarrantyId === bookingWarrantyId);
        
      if (isValidCall && !callAccepted && !hasCalled.current) {
        console.log('Valid incoming call received');
        dispatch(setCurrentSessionId(sessionId));
        dispatch(setCall({ 
          isReceivingCall: true, 
          from: from, 
          name: name, 
          signal: signal 
        }));
        setConnectionStatus('incoming');
      }
    };

    const handleCallAccepted = (signal) => {
      console.log('Call accepted, received signal');
      if (connectionRef.current && isInitiator.current) {
        dispatch(setCallAccepted(true));
        setConnectionStatus('connected');
        connectionRef.current.signal(signal.signalData || signal);
      }
    };

    const handleCallEnded = () => {
      console.log('Call ended by remote user');
      handleCallTermination('ended');
    };

    const handleCallDeclined = () => {
      console.log('Call declined by remote user');
      handleCallTermination('declined');
      toast.info('Call was declined', { position: 'top-right', autoClose: 3000 });
    };

    socket.on('callUser', handleCallUser);
    socket.on('callAccepted', handleCallAccepted);
    socket.on('callEnded', handleCallEnded);
    socket.on('callDeclined', handleCallDeclined);

    return () => {
      socket.off('callUser', handleCallUser);
      socket.off('callAccepted', handleCallAccepted);
      socket.off('callEnded', handleCallEnded);
      socket.off('callDeclined', handleCallDeclined);
    };
  }, [dispatch, bookingId, callAccepted]);

  // Handle call termination
  const handleCallTermination = (reason) => {
    console.log(`Call terminated: ${reason}`);
    dispatch(setCallEnded(true));
    
    if (connectionRef.current) {
      connectionRef.current.destroy();
      connectionRef.current = null;
    }
    
    stopStream(`call ${reason}`);
    setRemoteStream(null);
    setConnectionStatus('ended');
    hasCalled.current = false;
    isInitiator.current = false;
    
    // Navigate back after a short delay
    setTimeout(() => {
      const redirectPath = bookingWarrantyId
        ? `/warranty?bookingWarrantyId=${bookingWarrantyId}`
        : `/booking/booking-processing?bookingId=${bookingId}`;
      navigate(redirectPath, { replace: true });
    }, 1000);
  };

  // Auto-initiate call or answer incoming call
  useEffect(() => {
    if (!stream || !user || hasCalled.current || !booking) {
      return;
    }

    // If answering an incoming call
    if (location.state?.answerCall && location.state?.incomingCall && !callAccepted) {
      console.log('Answering incoming call');
      hasCalled.current = true;
      answerIncomingCall(location.state.incomingCall);
      return;
    }

    // If initiating a call (not receiving and not already accepted)
    if (!call.isReceivingCall && !callAccepted && !location.state?.answerCall) {
      const otherUserId = user._id === booking?.customerId?._id
        ? booking?.technicianId?.userId?._id
        : booking?.customerId?._id;
        
      if (otherUserId) {
        console.log(`Initiating call to user: ${otherUserId}`);
        hasCalled.current = true;
        isInitiator.current = true;
        callUser(otherUserId);
      }
    }
  }, [stream, user, call.isReceivingCall, callAccepted, location.state, booking]);

  const callUser = (targetUserId) => {
    const socket = getSocket();
    if (!socket || !stream) {
      console.log('Cannot call user, stream or socket unavailable');
      return;
    }

    console.log('Setting up call to user:', targetUserId);
    setConnectionStatus('calling');
    
    const peer = new Peer({ 
      initiator: true, 
      trickle: false, 
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    peer.on('signal', async (signalData) => {
      console.log('Sending call signal to:', targetUserId);
      try {
        const result = await dispatch(initiateCall({
          bookingId,
          to: targetUserId,
          signalData,
          name: user.fullName,
          warrantyId: bookingWarrantyId || null
        })).unwrap();

        // Emit socket event
        socket.emit('callUser', {
          userToCall: targetUserId,
          signalData,
          from: user._id,
          name: user.fullName,
          sessionId: result.sessionId,
          bookingId: bookingWarrantyId ? null : bookingId,
          warrantyId: bookingWarrantyId || null
        });

        dispatch(setCurrentSessionId(result.sessionId));
        console.log('Call initiated successfully with sessionId:', result.sessionId);
      } catch (error) {
        console.error('Failed to initiate call:', error);
        setConnectionStatus('failed');
        toast.error('Failed to initiate call');
      }
    });

    peer.on('stream', (remoteStream) => {
      console.log('Received remote stream');
      setRemoteStream(remoteStream);
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
    });

    peer.on('connect', () => {
      console.log('Peer connected successfully');
      setConnectionStatus('connected');
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      setConnectionStatus('error');
      toast.error('Connection error occurred');
      handleCallTermination('error');
    });

    peer.on('close', () => {
      console.log('Peer connection closed');
      setConnectionStatus('ended');
    });

    connectionRef.current = peer;
  };

  const answerIncomingCall = (incomingCallData) => {
    const socket = getSocket();
    if (!socket || !stream) {
      console.log('Cannot answer call, stream or socket unavailable');
      return;
    }

    console.log('Answering call from:', incomingCallData.from);
    setConnectionStatus('answering');
    dispatch(setCallAccepted(true));

    const peer = new Peer({ 
      initiator: false, 
      trickle: false, 
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    peer.on('signal', async (signalData) => {
      console.log('Sending answer signal to:', incomingCallData.from);
      try {
        await dispatch(answerCall({
          sessionId: currentSessionId,
          signal: signalData,
          to: incomingCallData.from
        })).unwrap();

        // Emit socket event
        socket.emit('answerCall', { 
          signal: { signalData }, 
          to: incomingCallData.from 
        });

        console.log('Call answered successfully');
      } catch (error) {
        console.error('Failed to answer call:', error);
        setConnectionStatus('error');
        toast.error('Failed to answer call');
      }
    });

    peer.on('stream', (remoteStream) => {
      console.log('Received remote stream in answer');
      setRemoteStream(remoteStream);
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
    });

    peer.on('connect', () => {
      console.log('Answering peer connected successfully');
      setConnectionStatus('connected');
    });

    peer.on('error', (err) => {
      console.error('Answering peer error:', err);
      setConnectionStatus('error');
      toast.error('Connection error occurred');
      handleCallTermination('error');
    });

    peer.on('close', () => {
      console.log('Answering peer connection closed');
      setConnectionStatus('ended');
    });

    // Signal the incoming call data
    peer.signal(incomingCallData.signal);
    connectionRef.current = peer;
  };

  const leaveCall = async () => {
    const socket = getSocket();
    if (!socket) return;

    console.log('Leaving call...');
    
    const otherUserId = call.from || (booking && (
      user._id === booking.customerId._id 
        ? booking.technicianId.userId._id 
        : booking.customerId._id
    ));

    if (otherUserId && currentSessionId) {
      try {
        await dispatch(endCall({
          sessionId: currentSessionId,
          to: otherUserId
        })).unwrap();

        socket.emit('endCall', { 
          to: otherUserId, 
          sessionId: currentSessionId,
          from: user._id 
        });
      } catch (error) {
        console.error('Failed to end call:', error);
        socket.emit('endCall', { 
          to: otherUserId, 
          sessionId: currentSessionId,
          from: user._id 
        });
      }
    }

    handleCallTermination('manual');
  };

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      if ((callAccepted || connectionRef.current) && !callEnded) {
        leaveCall();
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      
      // Cleanup on unmount
      if ((callAccepted || connectionRef.current) && !callEnded) {
        const cleanup = async () => {
          if (call.isReceivingCall && !callAccepted) {
            // Decline incoming call
            const socket = getSocket();
            if (socket && currentSessionId && call.from) {
              try {
                await dispatch(declineCall({
                  sessionId: currentSessionId,
                  to: call.from
                }));
                
                socket.emit('callDeclined', {
                  to: call.from,
                  from: user._id,
                  sessionId: currentSessionId
                });
              } catch (error) {
                console.error('Failed to decline call:', error);
              }
            }
          } else {
            // End active call
            leaveCall();
          }
        };
        
        cleanup();
      }
      
      if (connectionRef.current) {
        connectionRef.current.destroy();
        connectionRef.current = null;
      }
      
      stopStream('component unmount');
    };
  }, [callAccepted, callEnded, call, currentSessionId]);

  const renderConnectionStatus = () => {
    switch (connectionStatus) {
      case 'calling':
        return 'Đang gọi...';
      case 'incoming':
        return 'Cuộc gọi đến...';
      case 'answering':
        return 'Đang chấp nhận...';
      case 'connected':
        return null;
      case 'failed':
      case 'error':
        return 'Kết nối thất bại';
      case 'ended':
        return 'Cuộc gọi đã kết thúc';
      default:
        return 'Đang kết nối...';
    }
  };

  return (
    <div className="custom-video-call-container">
      <div className="custom-video-container">
        <div className="custom-video-wrapper remote">
          <span className="custom-video-label">
            {call.name || 'Remote User'}
          </span>
          {callAccepted && !callEnded && remoteStream ? (
            <video
              className="custom-video"
              playsInline
              ref={userVideo}
              autoPlay
            />
          ) : (
            <div className="custom-waiting-message">
              {renderConnectionStatus()}
            </div>
          )}
        </div>
        
        <div className="custom-video-wrapper local">
          <span className="custom-video-label">Bạn</span>
          {stream ? (
            <video
              className="custom-video"
              playsInline
              muted
              ref={myVideo}
              autoPlay
            />
          ) : (
            <div className="custom-waiting-message">
              Đang tải camera...
            </div>
          )}
        </div>
      </div>
      
      <div className="custom-controls">
        <button className="custom-btn-hangup" onClick={leaveCall}>
          <MdCallEnd size={24} color="white" />
        </button>
      </div>
    </div>
  );
};

export default VideoCallPage;