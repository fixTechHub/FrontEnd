import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Peer from 'simple-peer';
import { setCall, setCallAccepted, setCallEnded, setCurrentSessionId, initiateCall, answerCall, endCall, declineCall } from '../../features/video-call/videoCallSlice';
import { fetchBookingById } from '../../features/bookings/bookingSlice';
import { getSocket } from '../../services/socket';

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
  const hasCalled = useRef(false); // Flag to prevent repeated call initiation

  const [stream, setStream] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const hasStopped = useRef(false); // Flag to prevent multiple stops

  const stopStream = (reason = 'unknown') => {
    if (stream && !hasStopped.current) {
      hasStopped.current = true;
      console.log(`Attempting to stop stream for user: ${user._id}, Reason: ${reason}`);
      stream.getTracks().forEach((track, index) => {
        console.log(`Stopping track ${index}: ${track.kind}, active: ${track.readyState === 'live'}`);
        track.stop();
      });
      if (myVideo.current) {
        myVideo.current.pause(); // Pause the video
        myVideo.current.srcObject = null;
        myVideo.current.load(); // Force reload to clear
      }
      if (userVideo.current) {
        userVideo.current.pause(); // Pause the video
        userVideo.current.srcObject = null;
        userVideo.current.load(); // Force reload to clear
      }
      setStream(null);
      console.log(`Stream stopped for user: ${user._id} (Reason: ${reason})`);
    } else if (!stream) {
      console.log(`No stream to stop for user: ${user._id}, Reason: ${reason}`);
    }
  };

  const initializeStream = async (attempt = 0) => {
    if (attempt >= maxRetries) {
      console.error(`Max retries (${maxRetries}) reached for media access`);
      stopStream('max retries');
      return;
    }
    try {
      console.log(`Attempting to initialize stream, attempt: ${attempt + 1}`);
      const currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(currentStream);
      if (myVideo.current) {
        myVideo.current.srcObject = currentStream;
      }
      console.log('Stream initialized successfully');
    } catch (error) {
      console.error(`Error accessing media devices, attempt ${attempt + 1}:`, error);
      setTimeout(() => initializeStream(attempt + 1), 1000); // Retry after 1 second
    }
  };

  useEffect(() => {
    const socket = getSocket();
    if (!socket) {
      console.error('Socket not available');
      return;
    }

    dispatch(fetchBookingById(bookingId));
    initializeStream();

    const handleCallUser = (data) => {
      console.log('Received callUser event:', data);
      if (!callAccepted && !hasCalled.current) {
        // Reset hasCalled if not in a call
        hasCalled.current = false;
        setStream(null); // Clear stream to force reinitialization
        initializeStream().then(() => {
          // Store the sessionId from the incoming call
          dispatch(setCurrentSessionId(data.sessionId));
          dispatch(setCall({ ...data, isReceivingCall: true }));
          // Navigate or show UI for incoming call (implement in parent if needed)
          console.log('Incoming call from:', data.from, 'with sessionId:', data.sessionId);
        });
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
        navigate(`/booking/booking-processing?bookingId=${bookingId}&technicianId=${booking.technicianId._id}`, { replace: true });
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
        dispatch(setCallEnded(true)); // Reset call state
        hasCalled.current = false; // Allow initiating a new call
        navigate(`/booking/booking-processing?bookingId=${bookingId}&technicianId=${booking.technicianId._id}`, { replace: true });
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
      if (connectionRef.current) {
        connectionRef.current.destroy();
        connectionRef.current = null;
      }
      stopStream('component unmount');
      hasCalled.current = false; // Reset for next call
    };
  }, [dispatch, bookingId, navigate, callEnded]);

  useEffect(() => {
    if (!stream || !user || hasCalled.current) {
      console.log('Stream or user not available, or call already initiated, skipping call initiation');
      return;
    }

    console.log('Checking call initiation conditions:', { callAccepted, locationState: location.state });
    if (!call.isReceivingCall && !callAccepted && !location.state?.answerCall) {
      const otherUserId = user._id === booking?.customerId?._id
        ? booking?.technicianId?.userId?._id
        : booking?.customerId?._id;
      if (otherUserId) {
        console.log(`Initiating call to user: ${otherUserId}`);
        hasCalled.current = true;
        callUser(otherUserId);
      }
    }
  }, [stream, user, call.isReceivingCall, callAccepted, location.state, booking]);

  useEffect(() => {
    if (!stream || !user || hasCalled.current) {
      console.log('Stream or user not available, or call already initiated, skipping answer');
      return;
    }

    if (location.state?.answerCall && location.state?.incomingCall && !callAccepted) {
      console.log('Answering incoming call from:', location.state.incomingCall.from);
      hasCalled.current = true;
      answerIncomingCall(location.state.incomingCall);
    }
  }, [stream, user, location.state, callAccepted, booking]);

  const callUser = (id) => {
    const socket = getSocket();
    if (!socket || !stream) {
      console.log('Cannot call user, stream or socket unavailable');
      return;
    }
    console.log('Setting up call to user:', id);
    dispatch(setCall({ isReceivingCall: false, from: user._id, name: user.fullName, signal: null }));
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on('signal', async (data) => {
      console.log('Sending call signal to:', id);
      try {
        // Use REST API to initiate call
        const result = await dispatch(initiateCall({
          bookingId,
          to: id,
          signalData: data,
          name: user.fullName
        })).unwrap();
        
        console.log('Call initiated successfully with sessionId:', result.sessionId);
      } catch (error) {
        console.error('Failed to initiate call:', error);
        socket.emit("callFailed", { message: "Failed to initiate call." });
      }
    });

    peer.on('stream', (currentStream) => {
      console.log('Received remote stream');
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      if (connectionRef.current) {
        connectionRef.current.destroy();
        connectionRef.current = null;
        stopStream('peer error');
      }
    });

    peer.on('close', () => {
      console.log('Peer connection closed');
      if (connectionRef.current) {
        connectionRef.current = null;
        stopStream('peer closed');
      }
    });

    socket.on('callAccepted', (signal) => {
      console.log('Call accepted, receiving signal');
      const receiverName = user._id === booking?.customerId?._id
        ? booking?.technicianId?.userId?.fullName
        : booking?.customerId?.fullName;
      dispatch(setCall({ ...call, name: receiverName }));
      dispatch(setCallAccepted(true));
      peer.signal(signal);
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
    dispatch(setCall({ isReceivingCall: false, from: incomingCallData.from, name: incomingCallData.name, signal: incomingCallData.signal }));
    dispatch(setCallAccepted(true));
    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on('signal', async (data) => {
      console.log('Sending answer signal to:', incomingCallData.from);
      try {
        // Use REST API to answer call
        await dispatch(answerCall({
          sessionId: currentSessionId,
          signal: data,
          to: incomingCallData.from
        })).unwrap();
        
        console.log('Call answered successfully');
      } catch (error) {
        console.error('Failed to answer call:', error);
      }
    });

    peer.on('stream', (currentStream) => {
      console.log('Received remote stream');
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      if (connectionRef.current) {
        connectionRef.current.destroy();
        connectionRef.current = null;
        stopStream('peer error');
      }
    });

    peer.on('close', () => {
      console.log('Peer connection closed');
      if (connectionRef.current) {
        connectionRef.current = null;
        stopStream('peer closed');
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
        // Use REST API to end call
        await dispatch(endCall({
          sessionId: currentSessionId,
          to: otherUserId
        })).unwrap();
        
        console.log('Call ended successfully');
      } catch (error) {
        console.error('Failed to end call:', error);
      }
    }

    if (connectionRef.current) {
      connectionRef.current.destroy();
      connectionRef.current = null;
    }
    stopStream('manual hang up');
    setTimeout(() => {
      stopStream('timeout fallback after manual hang up');
    }, 3000); // Increased to 3 seconds for reliability
    navigate(`/booking/booking-processing?bookingId=${bookingId}&technicianId=${booking.technicianId._id}`, { replace: true });
    window.location.reload();
  };

  return (
    <div className="container">
      <h1>Video Call</h1>
      <div className="video-container" style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <div className="video">
          <h3>You</h3>
          {stream && <video playsInline muted ref={myVideo} autoPlay style={{ width: '400px', border: '1px solid black' }} />}
        </div>
        <div className="video">
          <h3>{call.name || 'Remote User'}</h3>
          {callAccepted && !callEnded ? (
            <video playsInline ref={userVideo} autoPlay style={{ width: '400px', border: '1px solid black' }} />
          ) : (
            <div style={{ width: '400px', height: '300px', border: '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Waiting for user to accept...
            </div>
          )}
        </div>
      </div>
      <div className="controls" style={{ textAlign: 'center', marginTop: '20px' }}>
        {callAccepted && !callEnded && (
          <button className="btn btn-danger" onClick={leaveCall}>
            Hang Up
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoCallPage;